// Export Note for use in Node.js
if (typeof exports != 'undefined')
  var Note = require('note')

QUnit.module('Note')

test('Note', function() {
  ok(Note, 'Note class should exist')
  ok(new Note() instanceof Note, 'Note should return a note')
  var note = new Note('hello world')
  equal(note.hello, 'world', 'Properties should be accessible')
  equal(typeof note.hello, 'string', 'Leafs should be strings')
  
  note.foo = 'bar'
  equal(note.foo, 'bar', 'Notes should be modifiable')
  
  note = new Note('foobar\n one 1')
  equal(typeof note.foobar, 'object', 'Notes should be objects')
  ok(note.foobar instanceof Note, 'Nested notes should be notes')
  
  note = new Note('list\nsingle value')
  equal(note.length(), 2, 'Note should have 2 names')
  ok(note.list instanceof Note, 'A name without a trailing space should be a note')
  
  note = new Note('body')
  ok(note.body instanceof Note, 'A name without a trailing space should be a note')
  
  note = new Note({foobar: 'hello'})
  equal(note.foobar, 'hello', 'Notes can be created from object literals')
  
  note = new Note({foobar: new Note('hello world')})
  equal(note.foobar.hello, 'world', 'Notes can be created from objects mixed with notes')

  note = new Note({foobar: {hello : { world : 'success'}}})
  equal(note.foobar.hello.world, 'success', 'Notes can be created from deep objects')

  // test multline creation
  string = 'user\n\
name Aristotle\n\
admin false\n\
stage\n\
name home\n\
domain test.test.com\n\
pro false\n\
domains\n\
 test.test.com\n\
  images\n\
  blocks\n\
  users\n\
  stage home\n\
  pages\n\
   home\n\
    settings\n\
     data\n\
      title Hello, World\n\
    block1\n\
     content Hello world\n'

  note = new Note(string)
  equal(note.domains['test.test.com'].pages.home.settings.data.title, 'Hello, World', 'Multiline creation should be okay.')

})

test('bytes', function() {

  var a = new Note('john\n age 5')
  equal(a.to_string().length, 12)

  a.john.age = 45
  equal(a.to_string().length, 13)

  var b = new Note('')
  equal(b.to_string().length, 0)

  var c = new Note('   h 1')
  equal(c.to_string().length, 4)

  var d = new Note('   h 1\n\n\n\n')
  equal(c.to_string().length, 4)

})

test('clear', function() {
  var a = new Note('hello world')
  equal(a.length(), 1)
  ok(a.clear() instanceof Note, 'clear should return this so its chainable')
  equal(a.length(), 0)
  

})

test('clone', function() {
  var a = new Note('hello world')
  var b = a.clone()
  equal(b.hello, 'world')
  b.hello = 'mom'
  equal(a.hello, 'world')
  var c = a
  equal(c.hello, 'world')
  c.hello = 'foo'
  equal(a.hello, 'foo')
  var d = c
  equal(d.hello, 'foo')
  d.hello = 'hiya'
  equal(a.hello, 'hiya')

  a.test = 'boom'
  equal(d.test, 'boom')
  a.foobar = new Note('123 456')
  equal(c.foobar['123'], '456')

  e = a
  equal(e.foobar['123'], '456')
  f = a.clone()
  equal(f.foobar['123'], '456')
  f.hi = 'test'
  equal(a.hi, undefined)

})

// For testing diffs of composites
function Page (note) {
  this.patch(note)
}

Page.prototype = new Note()

function Block (id, note) {
  this.id = id
  this.patch(note)
}

Block.prototype = new Note()
Block.prototype.privates = ['id']

test('diff', function() {

  var a = new Note('hello world')
  var b = new Note('hello mom')
  var c = new Note('first John')

  
  equal(a.diff(b).to_string(), 'hello mom\n')
  equal(a.diff(c).to_string(), 'hello\nfirst John\n')
  
  equal(a.diff(c).first, 'John')

  a = new Note('hi 1')
  b = new Note('hi 1')
  var diff = a.diff(b)
  ok(diff instanceof Note, 'diff is a note')
  equal(diff.toString(), '', 'No difference')


  a = new Note('hi 1')
  b = new Note()
  b.hi = 1
  equal(a.diff(b), '')
  
  
  var d = new Note()
  var e = new Note('z-index 0')
  var patch = d.diff(e)
  equal(patch.toString(), 'z-index 0\n')
  e['z-index'] = 0
  var patch = d.diff(e)
  equal(patch.toString(), 'z-index 0\n')
  
  var page = new Page('body\n b1\n  content hi')
  var page2 = new Page('body\n b1\n  content hi')
  var page3 = new Page('body\n b1\n  content hi')
  var block = new Block('foobar')
  var block2 = new Block('b2')
  ok(block instanceof Note, 'block is instance of Note')
  ok(block instanceof Block, 'block is instance of Block')
  equal(block.id, 'foobar', 'id is set')
  equal(block2.id, 'b2', 'id is set')
  
  var diff = block.diff(block2)
  
  equal(diff.length(), 0, 'Difference between 2 notes should not check privates.')
  var diff = block2.diff(block)
  equal(diff.length(), 0, 'Difference between 2 notes should not check privates.')
  
  ok(page instanceof Note, 'page is instance of Note')
  ok(page instanceof Note, 'page is instance of Page')
  ok(page.length(), 'page has 1 name/value')
  
  page.body['foobar'] = block
  page2.body['foobar'] = block2
  diff = page.diff(page2)
  equal(page.to_string(), page2.to_string(), 'Pages should be equal')
  equal(diff.length(), 0, 'Difference between 2 composites should not check privates in sub parts.')
  
  
  ok(page.body.foobar instanceof Block, 'block1 is instance of Block')
  
  diff = page3.diff(page2)
  
  ok(diff.body.foobar instanceof Note, 'block1 in page3 diff is instance of note')
  ok(!diff.body.foobar.id, 'id did not get set')
  
  

})

test('each', function() {

  var a = new Note('john\n age 5\nsusy\n age 6\n')

  ok(a.each(function(p, i) {
    p.age = parseFloat(p.age) + 1
  }) instanceof Note, 'should be chainable')

  equal(a.get('john age'), '6', 'johns age shuold be icnremented')
  equal(a.get('susy age'), '7', 'susys age should be incremented')
})

test('equals', function() {

  var a = new Note('maine me\nnew_york nyc')
  var b = new Note('maine me\nnew_york nyc\n')
  ok(a.equals(b))

  var a = new Note('maine me\nnew_york nyc\nzips\n 1 123\n 2 234')
  var b = new Note('maine me\nnew_york nyc\n')
  b.zips = new Note()
  b.zips['1'] = 123
  b.zips['2'] = 234
  ok(a.equals(b))
})

test('escape_html', function() {
  var a = new Note()
  equal(Note.escape_html('<'), '&lt;')
  equal(Note.escape_html('<<'), '&lt;&lt;')
  equal(Note.escape_html('>'), '&gt;')
  equal(Note.escape_html('&'), '&amp;')
  equal(Note.escape_html('"'), '&quot;')
  equal(Note.escape_html('<a href="foobar">at&b</a>'), '&lt;a href=&quot;foobar&quot;&gt;at&amp;b&lt;/a&gt;')
})

test('filter', function() {

  var a = new Note('john\n age 5\nsusy\n age 6\n')

  var c = a.filter(function(p) {
    return p.age > 5
  })

  equal(c.length(), 1)
})

test('first', function() {

  var a = new Note('maine me\nnew_york nyc')
  ok(a.first())
  equal(a.first().length(), 1)
  equal(a.first().bytes(), 9)
  ok(a.first().equals(new Note('maine me')))
})

test('first_name', function() {

  var a = new Note('maine me\nnew_york nyc')
  ok(a.first_name())
  equal(a.first_name(), 'maine')
})

test('get', function() {

  var value = new Note('hello world')
  equal(value.get('hello'), 'world')

})

test('get_float', function() {

  var a = new Note('five 5')
  a.ages = new Note()
  a.ages.one = '1'
  ok(a.get_float('five') === 5)
  ok(a.get_float('ages one') === 1)

})

test('last', function() {

  var a = new Note('maine me\nnew_york nyc')
  ok(a.last())
  equal(a.last().length(), 1)
  equal(a.last().bytes(), 13)
  ok(a.last().equals(new Note('new_york nyc')))
})

test('last_name', function() {

  var a = new Note('maine me\nnew_york nyc')
  ok(a.last_name())
  equal(a.last_name(), 'new_york')
})

test('leaves', function() {

  var a = new Note('hello world\naloha hawaii')
  ok(a instanceof Note)
  equal(a.leaves(), 2)

})

test('length', function() {
  
  var a = new Note()
  equal(a.length(), 0)

  var a = new Note('maine me\nnew_york nyc')
  equal(a.length(), 2)
  delete a.maine
  equal(a.length(), 1)
  
  
})

test('map', function() {

  var a = new Note('john\n age 5\nsusy\n age 6\n')

  var c = a.map(function(p) {
    p.age = parseFloat(p.age) + 1
  })

  equal(c.get('john age'), '6')
  equal(c.get('susy age'), '7')
  equal(a.get('john age'), '5')
  equal(a.get('susy age'), '6')
})

test('names', function() {

  var a = new Note('hello world\naloha hawaii')
  deepEqual(a.names(), {
    hello: 'hello',
    aloha: 'aloha'
  })

})

test('next', function() {

  var a = new Note('john\n age 5\nsusy\n age 6\nbob\n age 10')

  
  equal(a.next('john'), 'susy')
  equal(a.prev('john'), 'bob')
  equal(a.next('susy'), 'bob')
  equal(a.prev('susy'), 'john')
  equal(a.prev('bob'), 'susy')
  equal(a.next('bob'), 'john')
})

test('notes', function() {

  var a = new Note('hello world\naloha hawaii')
  equal(a.notes(), 0)
  var a = new Note('hello world\naloha hawaii\nsome\n nested\n  note boom')
  equal(a.notes(), 2)

})

test('patch', function() {

  var a = new Note('hello world')
  equal(a.get('hello'), 'world')
  var b = new Note('hello mom')
  a.patch(b)
  equal(a.hello, 'mom')
  var c = new Note('hello mom')
  c.hello = new Note('foo\n cell 123')
  a.patch(c)
  equal(a.hello.foo.cell, '123')


  a = new Note('style\n background-color rgb(57, 112, 1)\n border 17px solid white\n color rgb(0, 0, 0)\n font-family Lato\n font-size 16px\n height 100\n left 379px\n top 200\n width 274px\n border-radius 35px\n')
  b = new Note('height 203\ntop 117\n')
  a.style.patch(b)
  equal(a.style.height, '203')
  equal(a.style.top, '117')

  a = new Note('background-color rgb(57, 112, 1)\nborder 17px solid white\ncolor rgb(0, 0, 0)\nfont-family Lato\nfont-size 16px\nheight 199px\nleft 379px\ntop 117px\nwidth 274px\nborder-radius 35px\n')
  b = new Note('height 202\ntop 117\n')
  a.patch(b)
  equal(a.height, '202')
  equal(a.top, '117')

  a = new Note('first John\nlast Doe')
  b = new Note('last\n 1 Doe\n 2 Smith')
  c = new Note('last Aaron')
  a.patch(b)
  equal(a.last['2'], 'Smith', 'test 2')
  a.patch(c)
  equal(a.last, 'Aaron')

  var patch = new Note()
  patch['first'] = 'Frank'
  patch['last'] = 'Grimes'
  a.patch(new Note(new Note(patch)))
  equal(a.last, 'Grimes')
  equal(a.first, 'Frank')

})

test('patch performance test', function() {
  var note = new Note()
  for (var i = 0; i < 1000; i++) {
    var patch = new Note()
    patch[Math.random()] = new Note('foobar hello\nworld world\nnested\n element 1\n element2\n  foobar hi')
    patch[Math.random()] = 'foobar'
    note.patch(patch)
  }
  equal(note.length(), 2000)
})

test('pluck', function() {

  var a = new Note('maine me\nnew_york nyc')
  var value = a.pluck('maine')
  equal(a.length(), 1)
  equal(value, 'me')
})

test('pop', function() {

  var a = new Note('maine me\nnew_york nyc')
  var value = a.pop()
  equal(a.length(), 1)
  equal(value, 'nyc')
})

test('prev', function() {

  var a = new Note('john\n age 5\nsusy\n age 6\nbob\n age 10')

  
  equal(a.next('john'), 'susy')
  equal(a.prev('john'), 'bob')
  equal(a.next('susy'), 'bob')
  equal(a.prev('susy'), 'john')
  equal(a.prev('bob'), 'susy')
  equal(a.next('bob'), 'john')
})

test('rest', function() {

  var a = new Note('maine me\nnew_york nyc\ncali ca')
  ok(a.rest())
  equal(a.rest().length(), 2)
  ok(a.rest().equals(new Note('new_york nyc\ncali ca')))
})

test('retrieve', function() {


  var string = new Note('user\n\
 name Aristotle\n\
 admin false\n\
 stage\n\
  name home\n\
  domain test.test.com\n\
 pro false\n\
 domains\n\
  test.test.com\n\
   images\n\
   blocks\n\
   users\n\
   stage home\n\
   pages\n\
    home\n\
     settings\n\
      data\n\
       title Hello, World\n\
     block1\n\
      content Hello world\n')

  var query = new Note('user\n name\n domains\n  test.test.com\n   pages\n    home\n     block1')
  var result = string.retrieve(query)
  console.log(result + '')
  ok(result instanceof Note, 'Retrieve returns a note')
  equal(result.length(), 1, '1 root node')
  equal(result.user.name, 'Aristotle', 'Name retrieved successfully')
  ok(typeof result.user.pro === 'undefined', 'Did not retrieve pro value')
  equal(result.user.domains['test.test.com'].pages.home.block1.content, 'Hello world')
})

test('set', function() {

  var value = new Note('hello world')
  equal(value.get('hello'), 'world')
  ok(value.set('hello', 'mom') instanceof Note, 'set should return instance so we can chain it')
  equal(value.get('hello'), 'mom', 'value should be changed')

})

test('shift', function() {

  var a = new Note('maine me\nnew_york nyc')
  var value = a.shift()
  equal(a.length(), 1)
  equal(value, 'me')
})

test('sort_by_name', function() {

  var a = new Note('hello world\naloha hawaii')
  var string = ''
  for (var i in a.names()) {
    string += i
  }
  deepEqual(string, 'helloaloha', 'should not be sorted')
  string = ''
  a = a.sort_by_name()
  for (var i in a.names()) {
    string += i
  }
  deepEqual(string, 'alohahello', 'should be sorted')

})

var sort_by_property = 'ben\n\
 age 29\n\
lees\n\
 age 58\n\
alex\n\
 age 28\n\
erin\n\
 age 30\n\
conor\n\
 age 32\n\
mairi\n\
 age 23\n\
jack\n\
 age 60\n\
breck\n\
 age 28\n\
'

test('sort_by_property', function() {
  
  var note = new Note(sort_by_property)
  equal(note.length(), 8, 'downloaded okay')
  var order = ''
  for (var i in note.names()) {
    order += i
  }
  equal(order, 'benleesalexerinconormairijackbreck', 'order as set')
  order = ''
  ok(note.sort_by_property, 'sort by property method exists')
  ok(note instanceof Note, 'note is correct instance type')
  for (var i in note.sort_by_property('age').names()) {
    order += i
  }
  equal(order, 'mairialexbreckbenerinconorleesjack', 'order sorted by age')
  
  order = ''
  for (var i in note.sort_by_property('age', true).names()) {
    order += i
  }
  equal(order, 'jackleesconorerinbenalexbreckmairi', 'order reverse sorted by age')

})


test('string_to_note', function() {

  a = new Note('text \n this is a string\n and more')

  equal(a.text, 'this is a string\nand more')

  b = new Note('a\n text \n  this is a string\n  and more')
  equal(b.a.text, 'this is a string\nand more')
  equal(b.to_string(), 'a\n text \n  this is a string\n  and more\n')

  var string = 'first_name John\nlast_name Doe\nchildren\n 1\n  first_name Joe\n  last_name Doe\n  children\n   1\n    first_name Joe Jr.\n    last_name Doe\n    age 12\ncolors\n blue\n red\nbio \n Hello this is\n my multline\n biography\n \n Theres a blank line in there as well\n \n \n Two blank lines above this one.\ncode <p></p>\n'
  c = new Note(string)
  equal(c.children['1'].children['1'].age, '12')
  equal(c.bytes(), string.length)
  equal(c.to_string(), string)

})

test('to_html', function() {

  var a = new Note('john\n age 5')
  equal(a.to_html(), '<pre style="color: #888888;">john\n age <span style="color: #444444;">5</span>\n</pre>')
})

test('to_javascript', function() {

  var a = new Note("hello world")
  equal(a.to_javascript(), 'new Note(\'hello world\\n\')')

  var b = new Note('hello \'world')
  equal(b.to_javascript(), "new Note(\'hello \\\'world\\n\')")

  var c = new Note('hello \'world\'')
  equal(c.to_javascript(), "new Note(\'hello \\\'world\\\'\\n\')")

  var d = new Note('hello "world"')
  equal(d.to_javascript(), "new Note(\'hello \"world\"\\n\')")

})

test('to_string', function() {

  var value = new Note('hello world')
  equal(value.to_string(), 'hello world\n')
  value.foo = 'bar'
  equal(value.to_string(), 'hello world\nfoo bar\n')

  var a = new Note('john\n age 5')
  equal(a.to_string(), 'john\n age 5\n')
  ok(a.to_string() != 'john\n age 5')

  a.multiline = 'hello\nworld'

  equal(a.to_string(), 'john\n age 5\nmultiline \n hello\n world\n')

  a.other = 'foobar'

  equal(a.to_string(), 'john\n age 5\nmultiline \n hello\n world\nother foobar\n')

  b = new Note('a\n text \n  this is a multline string\n  and more')
  equal(b.to_string(), 'a\n text \n  this is a multline string\n  and more\n')
  a.even_more = b
  equal(a.to_string(), 'john\n age 5\nmultiline \n hello\n world\nother foobar\neven_more\n a\n  text \n   this is a multline string\n   and more\n')
  
  
  var e = new Note('z-index 0')
  e['z-index'] = 0
  equal(e.toString(), 'z-index 0\n')
})

test('union', function() {

  var a = new Note('maine me\nnew_york nyc\ncali ca')
  var b = new Note('maine me\nnew_york nyc\ncali ca')
  var c = new Note('maine me')
  var d = new Note('maine me\nflorida fl\ncali ca')
  ok(a.union(b))
  equal(a.union(b).length(), 3)
  equal(a.union(c).length(), 1)
  ok(a.union(c).equals(c))
  
  equal(a.union(b, c, d).length(), 1, 'union should take multiple params')
  equal(a.union(b, d).length(), 2)
  equal(d.union(a, b, c).length(), 1)
  
  a = new Note('font-family Arial\nbackground red\ncolor blue\nwidth 10px')
  b = new Note('font-family Arial\nbackground green\ncolor blue\nwidth 10px')
  c = new Note('font-family Arial\nbackground orange\ncolor blue\nwidth 12px')
  d = new Note('font-family Arial\nbackground #aaa\ncolor blue\nwidth 12px')
  e = new Note('font-family Arial\nbackground #fff\ncolor blue\nwidth 121px')
  
  var union = a.union(b, c, d, e)
  equal(union.length(), 2)
  equal(union.color, 'blue')
  equal(union['font-family'], 'Arial')
  
  union = a.union.apply(a, [b, c, d, e])
  equal(union.length(), 2)
  
  
})

test('static properties', function() {
  
  ok(Note.copyright)
  ok(Note.authors)
  ok(Note.homepage)
  ok(Note.license)

})
