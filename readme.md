Note
====

Note is a structured, human readable, concise language for encoding data.

Note is designed to make it easy for both humans and programmers to read, write, edit, and share objects.

Example
-------

Here's how I could encode an object named Earth:

    Earth
     age 4,540,000,000yrs
     moons 1
     neighbors
      Mars
      Venus
     population 6,973,738,433
     radius 6.371km

Structure
---------

Note uses whitespace to give the data structure. The space between age and 4,540,000,000yrs tells the computer that the age of this earth object equals 4,540,000,000yrs. Because Mars is indented past neighbors, we know that Mars is a member of the neighbors object.

Human Readable
--------------

Note has no syntax characters other than whitespace to make it as easy to read and edit as possible. Unlike other languages such as XML or JSON, Note is designed to be easy for beginner programmers and complete laypersons to read and edit.

Concise
-------

Note has a very carefully selected feature set in order to be extremely useful and extremely simple. There are no syntax characters other than whitespace, no types other than strings and nested notes, and Note uses the smallest amount of whitespace possible to establish structure. Unlike other whitespace languages which use 2-4 spaces (or the tab character), Note only uses a single space to indent an item or a single newline to seperate key/value pairs.


Using Note with Javascript
--------------------------

The first implementation of Note, included in this repo, is in Javascript. Note is very similar to JSON. You could write the Earth object above in JSON like this:

    {"Earth":
     {"age":"4,540,000,000yrs",
     "moons":"1",
     "neighbors":
       {"Mars":{},
         "Venus":{}},
     "population":"6,973,738,433",
    "radius":"6.371km"}}"

In both encodings, this object has a property "moons" that has a value of "1", and has a property population that has a value of "6,973,738,433". In both encodings, I could access the population property like this:

    earth.population


The Spec
--------

Note has just a few rules involving spaces and new lines that makes the whole thing work. Note has two, and only 2, special characters:

1. The Space Character.
2. The New Line Character.

A Note object is simply a list of name/value pairs. A single space character(" ") separates the name and value. A new line separates pairs. Names are always strings. Names can contain any character except space or newline. Values can be either strings or nested Note objects and can contain any character.

Use Cases
---------

Note is **great** for web APIs. Anywhere JSON or XML is used, Note is probably a better choice. Note is very similar to JSON without the syntax and without the types.

Diff and Patch
--------------

One of the primary design goals of Note was to create an encoding that makes diffing and patching easy. With Note, it couldn't be easier:

    // Note
    email john@doe.com
    gender male
    phone_numbers
     home 555-5555
     
    

Programming Languages
---------------------

Note does not care what programming language you use. Although the implementation of Note included here is built in Javascript, Note can be read, written, and modified easily with any programming language. In fact, one of the main benefits of Note is that it can be used by many programs, with many different languages, and they can all easily share data using Note.

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
- Open example.html for a very basic usage example.


Some Neat Properties
--------------------

- Besides spaces and new lines, there are no syntax characters in Note.
- The difference between two notes is a note.
- There is no such thing as a syntax error in Note.


Extending Note
--------------

Although Note has no types and very few features, you can easily build encodings on top of Note that do have types and additional features. Although Note requires that all leaves be strings or nested notes, your extension can expect a leaf to follow a certain encoding (ie: HTML, JSON, Markdown, Base64, et cetera.).

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

We've built an encoding on top of Note called Blocks, that works as powerful template language for HTML. We've also built an encoding that can turn a full filesystem into Note and vice versa, using base64 encoding of binary data.

Javascript API
--------------

The Javascript library in this repo works in both the browser and with Node.js.

The API is still somewhat in flux, but there are many neat methods such as diff, patch, and toString that demonstrate the power of Note.

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

OR you can make your code expect a leaf node to contain a string encoded type:

    winners joe bob sam
    winners ['joe', 'bob', 'sam]

The reason for making order unimportant in Note was to ensure that the difference between 2 notes is itself note.


Influences
----------

Note was inspired by JSON and HAML, and our desire for a simpler, more universal object encoding with less syntax.



