Note
====

Note is a concise encoding for hash tables.

Note is designed to make it easy for both humans and programmers to read, write, edit, and share hash tables.

Example
-------

Here's how I could encode a hash table named Earth:

    Earth
     age 4,540,000,000yrs
     moons 1
     neighbors
      Mars
      Venus
     population 6,973,738,433
     radius 6.371km

Design Goals
------------

**Human Readable**. Note has no syntax characters other than whitespace to make it easy to read and edit. Unlike other languages such as XML or JSON, Note is designed to be easy for beginner programmers and complete laypersons to read and edit.

**Concise**. Note has just a few features to make it simple and broadly usable. There are no syntax characters other than whitespace, no types other than strings and nested hash tables, and Note uses the smallest amount of whitespace possible to establish structure. Unlike other whitespace languages which use 2-4 spaces (or the tab character), Note only uses a single space to indent an item or a single newline to seperate key/value pairs.

**Extendable**. Note is useful to solve many problems as is. However, Note is designed to be extendable. Although Note has no types other than hash tables and strings, you can build domain specific languages on top of Note that expect other types as encoded strings. Example: https://github.com/breck7/blocks


Technical Spec
--------------

**Data Structures**. Note is a serialization format for recursive hash tables. Note uses 2 data structures: hash tables and strings.

**Syntax Characters**. Note has two special characters:

1. The Space Character.
2. The New Line Character.

A Note object is simply a hash table. A single space character(" ") separates a name with its value. A new line separates pairs. Names are always strings. Names can contain any character except space or newline. Values can be either strings or nested Note objects and can contain any character. A newline plus indented space indicates a nested hash table.


Programming Languages
---------------------

Note does not care what programming language you use. Although the implementation of Note included here is built in Javascript, Note can be read, written, and modified easily with any programming language. In fact, one of the main benefits of Note is that it can be used by many programs, with many different languages, and they can all easily share hash tables using Note.

More Examples
-------------

### Basic Example

    email john@doe.com

In the Note object above, "email" is a name, and "john@doe.com" is the corresponding value.

### A Note object with multiple pairs

    email john@doe.com
    gender male

In the Note object above,  "email" and "gender" are names, and "john@doe.com" and "male" are the corresponding values.

You can set values as strings like in the examples above, or you can set values to be nested Note objects by putting a newline immediately after the name and by indenting each item in the nested Note object by 1 space.

### Nested Note

    email john@doe.com
    gender male
    phone_numbers
     home 555-5555
     cell 444-4444

In this example, the value of phone_numbers is itself another Note object.

### Multiline strings

    email john@doe.com
    gender male
    phone_numbers
     home 555-5555
     cell 444-4444
    biography This is my bio.
     It it written on multiple lines.
     There is a space after biography above, which instructs the code that this is
     a multiline string, and not a nested Note object.
     The end.
 
Values can be multiline strings by adding a space after the name (in this case "biography") and indenting the additional lines by one space.

Examples
--------

- Visit http://noteapi.com to play with some popular APIs using Note.
- See https://github.com/breck7/blocks for an example of a higher level encoding built on Note.

Extending Note
--------------

Although Note has no types and very few features, you can easily build encodings on top of Note that do have types and additional features. Your extension can expect a leaf to follow a certain encoding (ie: HTML, JSON, CSV, Markdown, Base64, et cetera.).

For example, you could build a class called Person, that extends note, and expects a JSON encoded array for the favorite_colors property.

    function Person (note) {
      this.patch(note)
      if (this.favorite_colors)
       this.favorite_colors = JSON.parse(this.favorite_colors)
    }
    Person.prototype = new Note()
    
    var joe = new Person('favorite_colors ["blue", "red", "green"]')
    console.log(joe.favorite_colors[0])
    // prints "blue"
    console.log(joe.favorite_colors[2])
    // prints "green"

Javascript API
--------------

The Javascript library in this repo works in both the browser and with Node.js.

The API is still somewhat in flux, but there are many neat methods such as diff, patch, and toString that demonstrate some neat features of Note.

Contributing
------------

If you'd like to contribute please contact me at breck7@gmail.com.

Testing
-------

[![Build Status](https://travis-ci.org/breck7/note.png?branch=master)](https://travis-ci.org/breck7/note)

Support
-------

Feel free to contact me at breck7@gmail.com for help using or extending Note.

Current Limitations
-------------------

### You cannot have spaces in names.

This object, with spaces in the name, cannot be represented in Note:

    { "This name has a space" : "value" }

To get around this you could rename the name, or use camelCasing or underscores instead of spaces.

### Order is not important in Note.

A Note is a hash table and not an array, and so:

    winners
     joe
     bob
     sam

is equivalent to

    winners
     bob
     joe
     sam

If order is important for your application, you must specify the numbers:

    winners
     1 joe
     2 bob
     3 sam

OR you can make your code expect a leaf node to contain an array type:

    winners joe bob sam
    winners ['joe', 'bob', 'sam]
    winners joe,bob,sam


Influences
----------

Note was inspired mostly by JSON and HAML, a bit by XML and YAML, and our personal desire for a simple, powerful encoding with less syntax.


