## Access Control

### DB Controls
https://docs.mongodb.com/v3.2/reference/configuration-options/#security.authorization
 
https://docs.mongodb.com/manual/reference/built-in-roles/



### Role Based Access Control
3 Types of Role Types

1. Object Based
2. Identity Based
3. **Role Based**

##### Example of Role Based Permissions
```
Editor
  + create content

Content Manager
  + approve content
  + delete content 
  + edit content

Admininstrator
  + add user
  + remove user
  + view user
  + delete user
```

