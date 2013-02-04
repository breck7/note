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

  
  equal(a.diff(b).toString(), 'hello mom\n')
  equal(a.diff(c).toString(), 'hello\nfirst John\n')
  
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
  equal(page.toString(), page2.toString(), 'Pages should be equal')
  equal(diff.length(), 0, 'Difference between 2 composites should not check privates in sub parts.')
  
  
  ok(page.body.foobar instanceof Block, 'block1 is instance of Block')
  
  diff = page3.diff(page2)
  
  ok(diff.body.foobar instanceof Note, 'block1 in page3 diff is instance of note')
  ok(!diff.body.foobar.id, 'id did not get set')
  
  

})


test('escapeHtml', function() {
  var a = new Note()
  equal(Note.escapeHtml('<'), '&lt;')
  equal(Note.escapeHtml('<<'), '&lt;&lt;')
  equal(Note.escapeHtml('>'), '&gt;')
  equal(Note.escapeHtml('&'), '&amp;')
  equal(Note.escapeHtml('"'), '&quot;')
  equal(Note.escapeHtml('<a href="foobar">at&b</a>'), '&lt;a href=&quot;foobar&quot;&gt;at&amp;b&lt;/a&gt;')
})

test('get', function() {

  var value = new Note('hello world')
  equal(value.get('hello'), 'world')

})

test('length', function() {
  
  var a = new Note()
  equal(a.length(), 0)

  var a = new Note('maine me\nnew_york nyc')
  equal(a.length(), 2)
  delete a.maine
  equal(a.length(), 1)
  
  
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

test('prev', function() {

  var a = new Note('john\n age 5\nsusy\n age 6\nbob\n age 10')

  
  equal(a.next('john'), 'susy')
  equal(a.prev('john'), 'bob')
  equal(a.next('susy'), 'bob')
  equal(a.prev('susy'), 'john')
  equal(a.prev('bob'), 'susy')
  equal(a.next('bob'), 'john')
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
  value.set('head style color', 'blue')
  debugger
  equal(value.get('head style color'), 'blue', 'set should have worked')

})

test('toSortedNote', function() {

  var a = new Note('hello world\naloha hawaii')
  var string = ''
  for (var i in a.names()) {
    string += i
  }
  deepEqual(string, 'helloaloha', 'should not be sorted')
  string = ''
  a = a.toSortedNote()
  for (var i in a.names()) {
    string += i
  }
  deepEqual(string, 'alohahello', 'should be sorted')

})

var toSortedNoteBy = 'ben\n\
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

test('toSortedNoteBy', function() {
  
  var note = new Note(toSortedNoteBy)
  equal(note.length(), 8, 'downloaded okay')
  var order = ''
  for (var i in note.names()) {
    order += i
  }
  equal(order, 'benleesalexerinconormairijackbreck', 'order as set')
  order = ''
  ok(note.toSortedNoteBy, 'sort by property method exists')
  ok(note instanceof Note, 'note is correct instance type')
  for (var i in note.toSortedNoteBy('age').names()) {
    order += i
  }
  equal(order, 'mairialexbreckbenerinconorleesjack', 'order sorted by age')
  
  order = ''
  for (var i in note.toSortedNoteBy('age', true).names()) {
    order += i
  }
  equal(order, 'jackleesconorerinbenalexbreckmairi', 'order reverse sorted by age')

})


test('loadFromString', function() {

  a = new Note('text \n this is a string\n and more')

  equal(a.text, 'this is a string\nand more')

  b = new Note('a\n text \n  this is a string\n  and more')
  equal(b.a.text, 'this is a string\nand more')
  equal(b.toString(), 'a\n text \n  this is a string\n  and more\n')

  var string = 'first_name John\nlast_name Doe\nchildren\n 1\n  first_name Joe\n  last_name Doe\n  children\n   1\n    first_name Joe Jr.\n    last_name Doe\n    age 12\ncolors\n blue\n red\nbio \n Hello this is\n my multline\n biography\n \n Theres a blank line in there as well\n \n \n Two blank lines above this one.\ncode <p></p>\n'
  c = new Note(string)
  equal(c.children['1'].children['1'].age, '12')
  equal(c.toString().length, string.length)
  equal(c.toString(), string)

})

test('toHtml', function() {

  var a = new Note('john\n age 5')
  equal(a.toHtml(), '<pre style="color: #888888;">john\n age <span style="color: #444444;">5</span>\n</pre>')
})

test('toJavascript', function() {

  var a = new Note("hello world")
  equal(a.toJavascript(), 'new Note(\'hello world\\n\')')

  var b = new Note('hello \'world')
  equal(b.toJavascript(), "new Note(\'hello \\\'world\\n\')")

  var c = new Note('hello \'world\'')
  equal(c.toJavascript(), "new Note(\'hello \\\'world\\\'\\n\')")

  var d = new Note('hello "world"')
  equal(d.toJavascript(), "new Note(\'hello \"world\"\\n\')")

})

test('toString', function() {

  var value = new Note('hello world')
  equal(value.toString(), 'hello world\n')
  value.foo = 'bar'
  equal(value.toString(), 'hello world\nfoo bar\n')

  var a = new Note('john\n age 5')
  equal(a.toString(), 'john\n age 5\n')
  ok(a.toString() != 'john\n age 5')

  a.multiline = 'hello\nworld'

  equal(a.toString(), 'john\n age 5\nmultiline \n hello\n world\n')

  a.other = 'foobar'

  equal(a.toString(), 'john\n age 5\nmultiline \n hello\n world\nother foobar\n')

  b = new Note('a\n text \n  this is a multline string\n  and more')
  equal(b.toString(), 'a\n text \n  this is a multline string\n  and more\n')
  a.even_more = b
  equal(a.toString(), 'john\n age 5\nmultiline \n hello\n world\nother foobar\neven_more\n a\n  text \n   this is a multline string\n   and more\n')
  
  
  var e = new Note('z-index 0')
  e['z-index'] = 0
  equal(e.toString(), 'z-index 0\n')
})

test('union', function() {

  var a = new Note('maine me\nnew_york nyc\ncali ca')
  var b = new Note('maine me\nnew_york nyc\ncali ca')
  var c = new Note('maine me')
  var d = new Note('maine me\nflorida fl\ncali ca')
  ok(Note.union(a, b))
  equal(Note.union(a, b).length(), 3)
  equal(Note.union(a, c).length(), 1)
  ok(Note.union(a, c).toString() === c.toString())
  
  equal(Note.union(a, b, c, d).length(), 1, 'union should take multiple params')
  equal(Note.union(a, b, d).length(), 2)
  equal(Note.union(d, a, b, c).length(), 1)
  
  a = new Note('font-family Arial\nbackground red\ncolor blue\nwidth 10px')
  b = new Note('font-family Arial\nbackground green\ncolor blue\nwidth 10px')
  c = new Note('font-family Arial\nbackground orange\ncolor blue\nwidth 12px')
  d = new Note('font-family Arial\nbackground #aaa\ncolor blue\nwidth 12px')
  e = new Note('font-family Arial\nbackground #fff\ncolor blue\nwidth 121px')
  
  var union = Note.union(a, b, c, d, e)
  equal(union.length(), 2)
  equal(union.color, 'blue')
  equal(union['font-family'], 'Arial')
  
  union = Note.union.apply(a, [b, c, d, e])
  equal(union.length(), 2)
  
  
})
