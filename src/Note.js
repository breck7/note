/**
 * @param {string|array|object|Note}
 */
function Note(properties)
{
  // Load from string
  if (typeof properties === 'string')
    return this.load_from_string(properties)
  
  // Load from object
  for (var i in properties) {
    if (!properties.hasOwnProperty(i))
      continue
    if (typeof properties[i] === 'object')
      this[i] = new Note(properties[i])
    else
      this[i] = properties[i]
  }
}

Note.copyright = '2012 Nudge Inc.'
Note.authors = 'Breck Yunits <breck7@gmail.com>, Ben Zulauf <bczulauf@gmail.com>'
Note.homepage = 'github.com/breck7/note'
Note.license = 'license www.opensource.org/licenses/MIT'

/**
 * Escape HTML characters.
 * @param {string}
 * @return {string}
 */
Note.escape_html = function (str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * @return {int} Length of the note as a string.
 */
Note.prototype.bytes = function () {
  return this.to_string().length
}

/**
 * Deletes all names and values.
 * @return this
 */
Note.prototype.clear = function () {
  for (var name in this.names()) {
    delete this[name] 
  }
  this.trigger('change')
  return this
}

/**
 * Returns a deep copied note.
 * @return {Note}
 */
Note.prototype.clone = function () {
  return new Note(this)
}

/**
 * Returns the difference between 2 notes. The difference between 2 notes is a note.
 *
 * b == a.patch(a.diff(b))
 *
 * todo: clean and refactor this.
 *
 * @param {Note} The note to compare the instance against.
 * @return {Note}
 */
Note.prototype.diff = function (note) {

  var diff = new Note()
  
  if (!(note instanceof Note))
    note = new Note(note)
  
  for (var name in this.names()) {
    
    // Case: Deleted
    if (!(name in note)) {
      diff[name] = ''
      continue
    }
    // Different Types
    if (typeof(this[name]) != typeof(note[name])) {
      if (typeof note[name] === 'object')
        diff[name] = new Note(note[name])
      
      // We treat a value of 1 equal to '1'
      else if (this[name] == note[name])
        continue
      else
        diff[name] = note[name]
      continue
    }
    // Strings, floats, etc
    if (typeof(this[name]) != 'object') {
      if (this[name] != note[name])
        diff[name] = note[name]
      continue
    }
    // Both are Objects
    var sub_diff = this[name].diff(note[name])
    if (sub_diff.length())
      diff[name] = sub_diff
  }
  // Leftovers are Additions
  for (var name in note.names()) {
    if (this.is_public_property(name))
      continue
    // If name is not a public property of note2, dont copy it
    if (note instanceof Note && !note.is_public_property(name))
      continue
    if (typeof note[name] != 'object') {
      diff[name] = note[name]
      continue
    }
    else if (note[name] instanceof Note)
      diff[name] = new Note(note[name].to_string())
    else
      diff[name] = new Note(note)
  }
  return diff
}

/**
 * Execute a function on each top name.
 * @param {function}
 * @return this
 */
Note.prototype.each = function (fn) {
  for (var name in this.names()) {
    if (this[name] instanceof Note)
      fn(this[name], name)
  }
  return this
}

/**
 * Are the Notes equal?
 * @param {Note}
 * @return {bool}
 */
Note.prototype.equals = function (note) {
  return this.to_string() === note.to_string()
}

/**
 * Does Note have any name/value pairs?
 * @return {bool}
 */
Note.prototype.empty = function (note) {
  for (var name in this) {
    if (this.is_public_property(name))
      return false
  }
  return true
}

/**
 * Remove Name/Value pairs that don't return true when passed to a function.
 * @param {function}
 * @return {Note}
 */
Note.prototype.filter = function (fn) {
  var copy = this.clone()
  for (var name in copy.names()) {
    if (!fn(copy[name]))
      delete copy[name]
  }
  return copy
}

/**
 * Return the first name/value pair.
 * @return {Note}
 */
Note.prototype.first = function () {
  var first = new Note()
  var copy = this.clone()
  for (var name in copy.names()) {
    first[name] = copy[name]
    return first
  }
}

/**
 * Return the first name
 * @return {string}
 */
Note.prototype.first_name = function () {
  for (var name in this.names()) {
    return name
  }
}

/**
 * Search the note for a given path (xpath).
 * @param {string}
 * @param {note}
 * @return The matching value
 */
Note.prototype.get = function (query, parent) {
  if (!query)
    return false
  if (!parent)
    parent = this
  var parts = query.split(/ /g),
      current = parts.shift()
  // Not set
  if (!(current in parent))
    return false
  // Leaf
  if (!parts.length)
    return parent[current]
  // Has children
  return this.get(parts.join(' '), parent[current])
}

/**
 * Run get but return a number or 0 if match isNan.
 * @return {number}
 */
Note.prototype.get_float = function (query) {
  var value = parseFloat(this.get(query))
  return (isNaN(value) ? 0 : value)
}

/**
 * We wrap hasOwnProperty so we can check against private properties
 * @param {string}
 * @return {bool}
 */
Note.prototype.is_private_property = function (name) {
  for (var i in this.privates) {
    if (this.privates[i] === name)
      return true
  }
  return false
}

/**
 * We wrap hasOwnProperty so we can check against private properties
 * @param {string}
 * @return {bool}
 */
Note.prototype.is_public_property = function (name) {
  if (!this.hasOwnProperty(name))
    return false
  return !this.is_private_property(name)
}

/**
 * Return the last name/value pair.
 * @return {Note}
 */
Note.prototype.last = function () {
  var last = new Note()
  var copy = this.clone()
  for (var name in copy.names()) {
    
  }
  last[name] = copy[name]
  return last
}

/**
 * Return the last name.
 * @return {string}
 */
Note.prototype.last_name = function () {
  for (var name in this.names()) {
  }
  return name
}

/**
 * Return the number of leaves. Deep
 * @return {int}
 */
Note.prototype.leaves = function () {
  var size = 0
  for (var name in this) {
    if (!this.is_public_property(name))
      continue
    if (this[name] instanceof Note)
      size += this[name].leafs()
    else
      size++
  }
  return size
}

/**
 * Return the number of name/value pairs. Shallow.
 * @return {int}
 */
Note.prototype.length = function () {
  var size = 0
  for (var name in this) {
    if (this.is_public_property(name))
      size++
  }
  return size
}

/**
 * Construct the Note from a string.
 * @param {string}
 * @return {Note}
 */
Note.prototype.load_from_string = function (string) {
  
  // Note always start on a name. Eliminate whitespace at beginning of string
  string = string.replace(/^[\n ]*/, '')
  
  /** Eliminate Windows \r characters and newlines at end of string.*/
  string = string.replace(/\n\r/g, '\n').replace(/\r\n/g, '\n')
  
  /** Eliminate newlines at end of string.*/
  string = string.replace(/[\n ]*$/, '')
  
  /** Note doesn't have useless lines*/
  string = string.replace(/\n\n+/, '\n')
  
  // Workaround for browsers without negative look ahead
  /*
  var notes_without_delimiter = string.split(/\n([^ ])/),
      notes = [notes_without_delimiter[0]]
  
  // Now we recombine notes.
  for (var i = 1; i < notes_without_delimiter.length; i = i + 2) {
    notes.push(notes_without_delimiter[i] + notes_without_delimiter[i+1])
  }
  */
  var notes = string.split(/\n(?! )/g)
  
  for (var i in notes) {
    var note = notes[i]
    if (matches = note.match(/^([^ ]+)(\n|$)/)) // Note
      this[matches[1]] = new Note(note.substr(matches[1].length).replace(/\n /g, '\n'))
    else if (matches = note.match(/^([^ ]+) /)) // Leaf
      this[matches[1]] = note.substr(matches[1].length + 1).replace(/^\n /, '').replace(/\n /g, '\n') 
  }
  return this
}

/**
 * Run a function on each name/value pair and return the resulting note.
 * @param {function}
 * @return {Note}
 */
Note.prototype.map = function (fn) {
  var copy = this.clone()
  copy.each(fn)
  return copy
}

/**
 * Return all names as an object.
 * @return {object}
 */
Note.prototype.names = function () {
  var names = {}
  for (var i in this) {
    if (!this.is_public_property(i))
      continue
    names[i] = i
  }
  return names
}

/**
 * Return the next name in the Note, given a name.
 * @param {string}
 * @return {string}
 */
Note.prototype.next = function (name) {
  var sorted = this.sorted_array(),
      next = sorted.indexOf(name) + 1
  if (sorted[next])
    return sorted[next]
  return sorted[0]
}

/**
 * Return a pretty HTML representation of the note.
 * @param {object}
 * @param {int}
 * @return {string}
 */
Note.prototype.note_to_html = function (obj, spaces) {
  if (!spaces)
   spaces = 0
  var string = ''
  for (var name in obj) {
    if (!obj.hasOwnProperty(name) || this.is_private_property(name))
      continue
    var value = obj[name]
    if (typeof value === 'undefined')
      value = ''
    string += this.str_repeat(' ', spaces) + name
    if (typeof value === 'object')
      string += '\n' + this.note_to_html(value, spaces + 1)
    else
      string += ' <span style="color: #444444;">' + Note.escape_html(value.toString().replace(/\n/g, '\n' + this.str_repeat(' ', spaces + name.length + 1))) + '</span>\n'
  }
  return string
}

/**
 * Return the number of notes. Deep
 * @return {int}
 */
Note.prototype.notes = function () {
  var size = 0
  for (var name in this) {
    if (!this.is_public_property(name))
      continue
    if (!(this[name] instanceof Note))
      continue
    size++
    size += this[name].notes()
  }
  return size
}

/**
 * Remove an event listener.
 * @param {string}
 * @param {function}
 * @return this
 */
Note.prototype.off = function (event, fn) {
  if (this._events && this._events[event] && this._events[event].indexOf(fn))
    this._events[event].splice(1,  this._events[event].indexOf(fn))
  return this
}

/**
 * Bind an event listener
 * @param {string}
 * @param {function}
 * @return this
 */
Note.prototype.on = function (event, fn) {
  if (!this._events)
    this._events = {}
  this._events[event] = []
  this._events[event].push(fn)
  return this
}

/**
 * Apply a patch to the Note instance.
 * @param {Note|string}
 * @return {Note}
 */
Note.prototype.patch = function (patch) {
  
  if (typeof patch === 'string')
    patch = new Note(patch)
  
  for (var name in patch) {
    
    // Repeat logic from names()
    if (!patch.hasOwnProperty(name) || this.is_private_property(name))
      continue

    // If patch value is a string, doesnt matter what type subject is.
    if (typeof patch[name] === 'string') {
      if (patch[name] === '')
        delete this[name]
      else
        this[name] = patch[name]
      continue
    }
    
    // If patch value is an int, doesnt matter what type subject is.
    if (typeof patch[name] === 'number') {
      this[name] = patch[name]
      continue
    }
    
    // If its an empty note, delete patch.
    if (patch[name] instanceof Note && patch[name].empty()) {
      delete this[name]
      continue
    }
    
    // If both subject value and patch value are Notes, do a recursive patch.
    if (this[name] instanceof Note) {
      this[name] = this[name].patch(patch[name])
      continue
    }
    
    // Final case. Do a deep copy of note.
    this[name] = new Note(patch[name])
  }
  this.trigger('change', patch)
  return this
}

/**
 * Remove and return a name/value pair from the instance.
 * @param {string}
 * @return The value
 */
Note.prototype.pluck = function (query) {
  var result
  if (!this[query])
    return ''
  if (this[query] instanceof Note)
    result = this[query].clone()
  else
    result = this[query]
  delete this[query]
  return result
}

/**
 * Remove the last name/value pair from the instance.
 * @return The value
 */
Note.prototype.pop = function () {
  var result
  for (var i in this.names()) {
  }
  if (this[i] instanceof Note)
    result = this[i].clone()
  else
    result = this[i]
  delete this[i]
  return result
}

/**
 * Return the previous name in the Note, given a name.
 * @param {string}
 * @return {string}
 */
Note.prototype.prev = function (name) {
  var sorted = this.sorted_array(),
      next = sorted.indexOf(name) - 1
  if (next >= 0)
    return sorted[next]
  return sorted[sorted.length - 1]
}

/**
 * String containing properties to not iterate over.
 */
Note.prototype.privates = ['_events']

/**
 * Delete the first element from the Note and return the rest as a new Note.
 * @return {Note}
 */
Note.prototype.rest = function () {
  var copy = this.clone()
  for (var name in this.names()) {
    delete copy[name]
    return copy
  }
}

/**
 * Recursively retrieve properties.
 * @param {note} 
 * @return Note
 */
Note.prototype.retrieve = function (note) {
  var result = new Note()
  
  for (var name in note.names()) {
    
    // If not doesnt have that property, continue
    if (!this[name])
      continue
    
    // If the request is a leaf or empty note, set
    if (!(note[name] instanceof Note) || !note[name].length()) {
      result[name] = this[name]
      continue
    }
    
    // Else the request is a note, make sure the subject is a note
    if (!(this[name] instanceof Note))
      continue
    
    // Now time to recurse
    result[name] = this[name].retrieve(note[name])
  }
  return result 
}

/**
 * Set a specific value via an xpath like query.
 * @param {string}
 * @param Value to set
 * @return this
 */
Note.prototype.set = function (query, value) {
  var parts = query.split(/ /g)
  var patch = new Note()
  for (var i = 0; i < parts.length - 1; i++) {
    patch[parts[i]] = new Note()
  }
  patch[parts[i]] = value
  this.patch(patch)
  this.trigger('change')
  return this
}

/**
 * Return and delete the first name/value in the Note.
 * @return The value
 */
Note.prototype.shift = function () {
  var result
  for (var i in this.names()) {
    if (this[i] instanceof Note)
      result = this[i].clone()
    else
      result = this[i]
    delete this[i]
    return result
  }
}

/**
 * Return a sorted version of the note
 *
 * @param {bool} Return Largest to Smallest?
 * @return {note}
 */
Note.prototype.sort_by_name = function (reverse) {
  
  var result = []
  for (var name in this.names()) {
    result.push(name)
  }
  result.sort()
  if (reverse)
    result.reverse()
  var note = new Note()
  for (var i in result) {
    note[result[i]] = this[result[i]]
  }
  return note
}

/**
 * Return a sorted version of the note by a certain property
 *
 * IE:
 *  ben
 *   age 29
 *  breck
 *   age 28
 *
 *  note.sort_by_property(age) (return ben, breck)
 *
 * @param {string}
 * @param {bool} Return largest to smallest?
 * @return {note}
 */
Note.prototype.sort_by_property = function (property_name, reverse) {
  
  var result = []
  for (var name in this.names()) {
    result.push([name, this[name][property_name]])
  }
  result = result.sort(function(a, b) {return (reverse ? b[1] - a[1] : a[1] - b[1])})
  var note = new Note()
  for (var i in result) {
    note[result[i][0]] = this[result[i][0]]
  }
  return note
}

/**
 * Return a sorted array
 * http://ejohn.org/blog/javascript-in-chrome/
 * @param {function}
 * @return {array}
 */
Note.prototype.sorted_array = function (sort_fn) {
  var result = []
  for (var name in this.names()) {
    if (!this.is_public_property(name))
      continue
    result.push(name)
  }
  result = result.sort()
  return result
}

/**
 * @param {string}
 * @param {int}
 * @return {string}
 */
Note.prototype.str_repeat = function (string, count) {
  var str = ''
  for (var i = 0; i < count; i++) {
    str += ' '
  }
  return str
}

/**
 * @return {string}
 */
Note.prototype.stringify = function () {
  return this.to_javascript()
}

/**
 * Return a pretty HTML printout of the note.
 * @return {string}
 */
Note.prototype.to_html = function () {
  return '<pre style="color: #888888;">' + this.note_to_html(this) + '</pre>'
}

/**
 * Return executable javascript code.
 * @return {string}
 */
Note.prototype.to_javascript = function () {
  return 'new Note(\'' + this.to_string().replace(/\n/g, '\\n').replace(/\'/g, '\\\'') + '\')'
}

/**
 * Return the object as JSON.
 * @return {string}
 */
Note.prototype.to_json = function () {
  return JSON.stringify(this)
}

/**
 * Return the instance in Note notation.
 * @param {int}
 * @return {string}
 */
Note.prototype.to_string = function (spaces) {
  spaces = spaces || 0
  var string = ''
  // Iterate over each property
  for (var name in this) {
    
    // Skip private properties
    if (!this.is_public_property(name))
      continue
    
    // If property value is undefined
    if (typeof this[name] === 'undefined') {
      string += '\n'
      continue
    }

    // Set up the name part of the name/value pair
    string += this.str_repeat(' ', spaces) + name
    
    // If the value is a note, concatenate it
    if (this[name] instanceof Note)
      string += '\n' + this[name].to_string(spaces + 1)
    
    // If an object (other than class of note) snuck in there
    else if (typeof this[name] === 'object')
      string += '\n' + new Note(this[name]).to_string(spaces + 1)
    
    // dont put a blank string on blank values.
    else if (this[name].toString() === '')
      string += '\n'
    
    // multiline string
    else if (this[name].toString().match(/\n/))
      string += ' \n' + this.str_repeat(' ', spaces + 1) + this[name].toString().replace(/\n/g, '\n' + this.str_repeat(' ', spaces + 1)) + '\n'
    
    // Plain string
    else
      string += ' ' + this[name].toString() + '\n'
  }
  return string
}

/**
 * @return {object}
 */
Note.prototype.toObject = function () {
  var obj = {}
  for (var name in this) {
    if (!this.is_public_property(name))
      continue
    if (this[name] instanceof Note)
     obj[name] = this[name].toObject()
    else
     obj[name] = this[name]
  }
  return obj
}

/**
 * @return {string}
 */
Note.prototype.toString =  function () {
  return this.to_string()
}

/**
 * @param {string}
 * @param {array}
 *
 */
Note.prototype.trigger = function (event, params) {
  if (!this._events || !this._events[event])
    return ''
  for (var i in this._events[event]) {
    this._events[event][i].call(this, params)
  }
}

/**
 * Return a new Note with the name/value pairs that all passed notes contain.
 * @param {array} Array of Notes or one note
 * @return {Note}
 */
Note.prototype.union = function (note_or_notes) {
  var union = this.union_single(arguments[0])
  for (var i in arguments) {
    if (i === 0) continue // skip the first one
    union = union.union_single(arguments[i])
    if (!union.length()) break
  }
  return union
}

/**
 * @param {Note}
 * @return {Note}
 */
Note.prototype.union_single = function(note) {
  var union = new Note()
  for (var name in this.names()) {
    if (this[name] instanceof Note)
      union[name] = this[name].union(note[name])
    if (this[name] === note[name])
      union[name] = this[name]
  }
  return union
}

// Export Note for use in Node.js
if (typeof exports != 'undefined')
  module.exports = Note;
