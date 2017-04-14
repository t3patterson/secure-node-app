## Injection Attacks
Injection attacks happen if query string parameters contain a snippet javascript code (rather than strings/integers) that can get injected into a server or DB.

### Avoid w/ Programmatic Query Structuring

- Avoid direct operators/commands that allow for arbitrary JS expressions. Use ORMs / ODMs and utility methods where possible.

**NO** (direct query)
```js
let query = {
	$where: `this.start >= new Date( ${req.query.startDate} ) &&
				this.end <= new Date( ${req.query.endDate} ) &&
				this.hidden == false`
}

SomeItem.find(query)	
```

**YES** (example w/ ORM)
```js
let query = {
	start: { $gte: req.query.startDate }
	end:   { $lte: req.query.endDate }

}

SomeItem.find(query)	

```

### Incorporate input validation for untrusted data (e.g. express-validator)


### For Mongodb, apply setup configuration file security to `javascriptEnabled: false`
in `/etc/mongod.conf`
```
security:
  javascriptEnabled: false
```

in terminal:
```
mongod --config /etc/mongod.conf
```
