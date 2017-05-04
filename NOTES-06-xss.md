## XSS

### Content Security Policy
HTTP response header that lets you reduce XSS risks on modern browsers by declaring what dynamic resources are allowed to load via http header.

**Example**:
```
Response Headers 
----------------
  CF-RAY:359c2cf040881fac-DFW
  Content-Type:text/html; charset=UTF-8
  Date: Thu, 04 May 2017 14:33:31 GMT
  Location:http://www.somesite.com/
  Content-Security-Policy: default-src 'none';   script-src 'self' 'http://code.jquery.com'; style-src 'self' 'unsafe-inline'; img-src 'self'
```

Three parts: 
  + header (Content-Security-Policy) 
  + directive (script-src) 
  + value (self)

### Configure Content Security Policy w/ [helmet](https://helmetjs.github.io/)
Install:
```
npm install --save helmet
```

Wire up middleware and implement `Content-Security-Policy` response header
```js
const helmet = require('helmet')
...
app.use(helmet.contentSecurityPolicy({
  directives : {
    defaultSrc: ["'none'"],
    scriptSrc: [
      "'self'", 
      "'unsafe-inline'",
      "http://code.jquery.com"

    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com"
    ],
    imgSrc: [
      "'self'",
      "data:"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "data:"
    ],
    connectSrc: [
      "'self'"
    ],
    // reportUri: "/cspviolation"
  }
}))
```

### Encoding (Escaping) User Input w/  [xss-filters](https://github.com/yahoo/xss-filters)
- important to escape untrusted user data

```js
let xssFilters from 'xss-filters'

...

UserRouter
  .get('/users/:id', (req, res) => {
    User.findById(req.params.id, (err, record) = > {
    ...
    let encodedUser = record.toObject()
    encodedUser.firstName = xssFilters.inHTMLdata(encodedUser.firstName)
    encodedUser.lastName = xssFilters.inHTMLdata(encodedUser.lastName)
    encodedUser.displayName = xssFilters.inHTMLdata(encodedUser.displayName)
    return res.json(encodedUser)
    
  })
  
})
```

### Sanitzing & Validating Data
- Sanitizing removes characters
- Validation
  + contains only values that you accept

### XSS (Cross Site Scripting) Prevention Cheat Sheet
https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet