/**
 * @param {string|array|object|Note}
 */
function Note(properties)
{
  // Load from string
  if (typeof properties === 'string')
    return this.loadFromString(properties)
  
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

/**
 * Escape HTML characters.
 * @param {string}
 * @return {string}
 */
Note.escapeHtml = function (str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * @param {string}
 * @param {int}
 * @return {string}
 */
Note.strRepeat = function (string, count) {
  var str = ''
  for (var i = 0; i < count; i++) {
    str += ' '
  }
  return str
}

/**
 * Return a new Note with the name/value pairs that all passed notes contain.
 * note: will probably be removed.
 * @param {array} Array of Notes
 * @return {Note}
 */
Note.union = function () {
  var union = Note.unionSingle(arguments[0], arguments[1])
  for (var i in arguments) {
    if (i === 1) continue // skip the first one
    union = Note.unionSingle(union, arguments[i])
    if (!union.length()) break
  }
  return union
}

/**
 * note: will probably be removed.
 * @param {Note}
 * @return {Note}
 */
Note.unionSingle = function(noteA, noteB) {
  var union = new Note()
  if (!(noteB instanceof Note))
    return union
  for (var name in noteA.names()) {
    if (noteA[name] instanceof Note && noteB[name] && noteB[name] instanceof Note)
      union[name] = Note.unionSingle(noteA[name], noteB[name])
    if (noteA[name] === noteB[name])
      union[name] = noteA[name]
  }
  return union
}

// Privates properties
Note.prototype.privates = []

/**
 * Deletes all names and values.
 * @return this
 */
Note.prototype.clear = function () {
  for (var name in this.names()) {
    delete this[name] 
  }
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
    if (this.isPublicProperty(name))
      continue
    // If name is not a public property of note2, dont copy it
    if (note instanceof Note && !note.isPublicProperty(name))
      continue
    if (typeof note[name] != 'object') {
      diff[name] = note[name]
      continue
    }
    else if (note[name] instanceof Note)
      diff[name] = new Note(note[name].toString())
    else
      diff[name] = new Note(note)
  }
  return diff
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
 * We wrap hasOwnProperty so we can check against private properties
 * @param {string}
 * @return {bool}
 */
Note.prototype.isPrivateProperty = function (name) {
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
Note.prototype.isPublicProperty = function (name) {
  if (!this.hasOwnProperty(name))
    return false
  return !this.isPrivateProperty(name)
}

/**
 * Return the number of name/value pairs. Shallow.
 * @return {int}
 */
Note.prototype.length = function () {
  var size = 0
  for (var name in this) {
    if (this.isPublicProperty(name))
      size++
  }
  return size
}

/**
 * Construct the Note from a string.
 * @param {string}
 * @return {Note}
 */
Note.prototype.loadFromString = function (string) {
  
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
 * Return all names as an object.
 * @return {object}
 */
Note.prototype.names = function () {
  var names = {}
  for (var i in this) {
    if (!this.isPublicProperty(i))
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
  var sorted = this.toArray(),
      next = sorted.indexOf(name) + 1
  if (sorted[next])
    return sorted[next]
  return sorted[0]
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
    if (!patch.hasOwnProperty(name) || this.isPrivateProperty(name))
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
    if (patch[name] instanceof Note && !patch[name].length()) {
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
  return this
}

/**
 * Return the previous name in the Note, given a name.
 * @param {string}
 * @return {string}
 */
Note.prototype.prev = function (name) {
  var sorted = this.toSortedArray(),
      next = sorted.indexOf(name) - 1
  if (next >= 0)
    return sorted[next]
  return sorted[sorted.length - 1]
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
  var edge = patch
  for (var i = 0; i < parts.length - 1; i++) {
    edge = edge[parts[i]] = new Note()
  }
  edge[parts[i]] = value
  this.patch(patch)
  return this
}

/**
 * @return {string}
 */
Note.prototype.stringify = function () {
  return this.toJavascript()
}

/**
 * Return an array of the keys
 * @return {Array}
 */
Note.prototype.toArray = function () {
  var output = []
  for (var i in this) {
    if (!this.hasOwnProperty(i))
      continue
    output.push(i)
  }
  return output
}

/**
 * Return a pretty HTML printout of the note.
 * @return {string}
 */
Note.prototype.toHtml = function () {
  return '<pre style="color: #888888;">' + this.toHtmlHelper(this) + '</pre>'
}

/**
 * Return a pretty HTML representation of the note.
 * @param {object}
 * @param {int}
 * @return {string}
 */
Note.prototype.toHtmlHelper = function (obj, spaces) {
  if (!spaces)
   spaces = 0
  var string = ''
  for (var name in obj) {
    if (!obj.hasOwnProperty(name) || this.isPrivateProperty(name))
      continue
    var value = obj[name]
    if (typeof value === 'undefined')
      value = ''
    string += Note.strRepeat(' ', spaces) + name
    if (typeof value === 'object')
      string += '\n' + this.toHtmlHelper(value, spaces + 1)
    else
      string += ' <span style="color: #444444;">' + Note.escapeHtml(value.toString().replace(/\n/g, '\n' + Note.strRepeat(' ', spaces + name.length + 1))) + '</span>\n'
  }
  return string
}

/**
 * Return executable javascript code.
 * @return {string}
 */
Note.prototype.toJavascript = function () {
  return 'new Note(\'' + this.toString().replace(/\n/g, '\\n').replace(/\'/g, '\\\'') + '\')'
}

/**
 * Return the object as JSON.
 * @return {string}
 */
Note.prototype.toJSON = function () {
  return JSON.stringify(this)
}

/**
 * @return {object}
 */
Note.prototype.toObject = function () {
  var obj = {}
  for (var name in this) {
    if (!this.isPublicProperty(name))
      continue
    if (this[name] instanceof Note)
     obj[name] = this[name].toObject()
    else
     obj[name] = this[name]
  }
  return obj
}

/**
 * Return a sorted array
 * http://ejohn.org/blog/javascript-in-chrome/
 * @return {array}
 */
Note.prototype.toSortedArray = function () {
  var result = []
  for (var name in this.names()) {
    if (!this.isPublicProperty(name))
      continue
    result.push(name)
  }
  result = result.sort()
  return result
}

/**
 * Return a sorted version of the note
 *
 * @param {bool} Return Largest to Smallest?
 * @return {note}
 */
Note.prototype.toSortedNote = function (reverse) {
  
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
 *  note.toSortedNoteBy('age') (return ben, breck)
 *
 * @param {string}
 * @param {bool} Return largest to smallest?
 * @return {note}
 */
Note.prototype.toSortedNoteBy = function (property_name, reverse) {
  
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
 * @return {string}
 */
Note.prototype.toString =  function (spaces) {
  spaces = spaces || 0
  var string = ''
  // Iterate over each property
  for (var name in this) {
    
    // Skip private properties
    if (!this.isPublicProperty(name))
      continue
    
    // If property value is undefined
    if (typeof this[name] === 'undefined') {
      string += '\n'
      continue
    }

    // Set up the name part of the name/value pair
    string += Note.strRepeat(' ', spaces) + name
    
    // If the value is a note, concatenate it
    if (this[name] instanceof Note)
      string += '\n' + this[name].toString(spaces + 1)
    
    // If an object (other than class of note) snuck in there
    else if (typeof this[name] === 'object')
      string += '\n' + new Note(this[name]).toString(spaces + 1)
    
    // dont put a blank string on blank values.
    else if (this[name].toString() === '')
      string += '\n'
    
    // multiline string
    else if (this[name].toString().match(/\n/))
      string += ' \n' + Note.strRepeat(' ', spaces + 1) + this[name].toString().replace(/\n/g, '\n' + Note.strRepeat(' ', spaces + 1)) + '\n'
    
    // Plain string
    else
      string += ' ' + this[name].toString() + '\n'
  }
  return string
}

/**
 * Return an array of tuples
 * @return {Array}
 */
Note.prototype.toTuples = function () {
  var output = []
  for (var i in this) {
    if (!this.hasOwnProperty(i))
      continue
    output.push([i, this[i]])
  }
  return output
}

// Export Note for use in Node.js
if (typeof exports != 'undefined')
  module.exports = Note;
