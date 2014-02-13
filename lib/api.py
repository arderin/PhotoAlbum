'''
Created on Feb 4, 2014

@author: Andrew
'''
import endpoints
from endpoints_proto_datastore.ndb import EndpointsModel
from endpoints_proto_datastore.ndb import EndpointsAliasProperty
from protorpc import message_types
from protorpc import messages
from google.appengine.ext import ndb
from protorpc import remote


CLIENT_ID = 'YOUR CLIENT ID'

class Comment(EndpointsModel):
    DEFAULT_ORDER = '-timestamp'
    
    _message_fields_schema = ('id', 'comment_text', 'owner', 'timestamp','parent')
    
    _parent = None
    
    comment_text = ndb.StringProperty(required=True)
    owner = ndb.UserProperty(required=True)
    timestamp = ndb.DateTimeProperty(auto_now_add=True)
    parent_kind = ndb.StringProperty(required=True)
    
    def SetKey(self):
        #Can only set the key if both the parent and the child ID are set.
        if self._parent is not None and self.id is not None:
            key = ndb.Key(self.parent_kind, self._parent, Comment, self.id)
        #Will set the key and attempt to update the entity if it exists.
        self.UpdateFromKey(key)
        
    def ParentSet(self, value):    
        self._parent = value
        if ndb.Key(self.parent_kind, value).get() is None:
            raise endpoints.NotFoundException('Parent %s does not exist.' % value)
        if self.id is None: 
            self.key = ndb.Key(self.parent_kind, self._parent, Comment, None)
        else:
            self.SetKey()

        self._endpoints_query_info.ancestor = ndb.Key(self.parent_kind, value)
        
    @EndpointsAliasProperty(setter=ParentSet,required=True,property_type= messages.IntegerField)
    def parent(self):
        if self._parent is None and self.key is not None:
            self._parent = self.key.parent().integer_id()
        return self._parent
    
    
    @EndpointsAliasProperty(setter=EndpointsModel.OrderSet,default=DEFAULT_ORDER)
    def order(self):
        return super(Comment, self).order
    
class Photo(EndpointsModel):
    DEFAULT_ORDER = '-timestamp'
    
    _message_fields_schema = ('id', 'photo_link', 'description', 'owner','timestamp','comments')
    
    photo_link = ndb.StringProperty(required=True)
    description = ndb.StringProperty(required=True)
    owner = ndb.UserProperty(required=True)
    timestamp = ndb.DateTimeProperty(auto_now_add=True)
    #comment_keys = ndb.KeyProperty(kind=Comment, repeated=True)  
    
    @EndpointsAliasProperty(repeated=True, property_type=Comment.ProtoModel())
    def comments(self):
        return Comment.query(ancestor=self.key).order(-Comment.timestamp).fetch()
    
    @EndpointsAliasProperty(setter=EndpointsModel.OrderSet,default=DEFAULT_ORDER)
    def order(self):
        return super(Photo, self).order
    

@endpoints.api(name='endpointsTest', version='v1',
               description='API for Endpoints Test',
               allowed_client_ids=[CLIENT_ID, endpoints.API_EXPLORER_CLIENT_ID])
class testApi(remote.Service):

    @Comment.method(user_required=True,
                 request_fields=('comment_text','parent_kind','parent'),
                 name='comment.insert',
                 path='comment')
    def insert_comment(self, comment):
        comment.owner = endpoints.get_current_user()
        comment.put()
        return comment
    
    @Comment.method(user_required=True,
                 request_fields=('id','parent','parent_kind'),
                 response_message=message_types.VoidMessage,
                 http_method='DELETE',
                 name='comment.delete_comment',
                 path='comment/delete')
    def delete_comment(self,comment):
        if comment.owner == endpoints.get_current_user():
            comment.key.delete()
        return message_types.VoidMessage()
    
    
        
    @Comment.method(user_required=True,
                       request_fields=('id','parent','parent_kind'),
                       name='comment.get',
                       http_method='GET',
                       path='comment/get')
    def get_comment(self, comment):
        return comment
    
    
    @Photo.method(user_required=True,
                 request_fields=('photo_link','description'),
                 name='photo.insert',
                 path='photo')
    def insert_photo(self, photo):
        photo.owner = endpoints.get_current_user()
        photo.put()
        return photo
    
    @Photo.query_method(
                       query_fields=('limit', 'pageToken','order'),
                       collection_fields=('id', 'photo_link', 'description','owner','timestamp'),
                       name='photos.list',
                       path='photos')
    def list_photos(self, query):
        return query
    
    @Photo.method(request_fields=('id',),
                 name='photo.get',
                 http_method='GET',
                 path='photo/{id}')
    def get_photo(self,photo):
        if not photo.from_datastore:
            raise endpoints.NotFoundException('Photo not found.')
        return photo
    
    @Photo.method(request_fields=('id',), 
                      user_required=True,
                      name='photo.delete_photo',
                      response_message=message_types.VoidMessage,
                      http_method='DELETE',
                      path='photo/delete/{id}')
    def delete_photo(self,photo):
        if photo.owner == endpoints.get_current_user():
            #delete any comments associated with photo
            ndb.delete_multi(Comment.query(ancestor=photo._key).fetch(keys_only=True))
            #delete photo
            photo._key.delete()
        
        return message_types.VoidMessage()
    


   



application = endpoints.api_server([testApi, ])
