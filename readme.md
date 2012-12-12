Note
====

Note is a simple language, designed for both humans and programmers, that makes it easy to read, write, edit, and share objects.

Example
-------

Here's how I could encode an object named Earth:

    earth
     age 4,540,000,000yrs
     moons 1
     neighbors
      mars
      venus
     population 6,973,738,433
     radius 6.371km

This same object, written in the current dominant object notation, JSON, might look like this:

    {"earth":
     {"age":"4,540,000,000yrs",
     "moons":"1",
     "neighbors":
       {"mars":{},
         "venus":{}},
     "population":"6,973,738,433",
    "radius":"6.371km"}}"

In both examples, this object has a property "moons" that has a value of "1", and has a property population that has a value of "6,973,738,433". In Javascript, I could access the population property like this:

    earth.population

Notice that while the behavior is close to identical, the Note encoding is much simpler, cleaner, and durable than the JSON encoding.

How it Works
------------

Note has just a few rules involving spaces and new lines that makes the whole thing work. Note has two, and only 2, special characters:

1. The Space Character.
2. The New Line Character.

A Note object is simply a list of name/value pairs. A single space character(" ") separates the name and value. A new line separates pairs. Names are always strings. Names can contain any character except space or newline. Values can be either strings or Note objects and can contain any character.

Use Cases
---------

Note is **great** for web APIs. Anywhere JSON or XML is used, Note is probably a better choice. Note is very similar to JSON without the syntax and without the types.

Programming Languages
---------------------

Note does not care what programming language you use. Although the implementation of Note included here is built in Javascript, Note can be read, written, and modified easily with any programming language. In fact, one of the main benefits of Note is that it can be used by many programs, with many different languages, and they can all easily share data using Note.

More Examples
-------------

## Basic Example

    email john@doe.com

In the Note object above, "email" is a name, and "john@doe.com" is the corresponding value.

## A Note object with multiple pairs

    email john@doe.com
    gender male

In the Note object above,  "email" and "gender" are names, and "john@doe.com" and "male" are the corresponding values.

You can set values as strings like in the examples above, or you can set values to be nested Note objects by putting a newline immediately after the name and by indenting each item in the nested Note object by 1 space.

## Nested Note

    email john@doe.com
    gender male
    phone_numbers
     home 555-5555
     cell 444-4444

In this example, the value of phone_numbers is itself another Note object.

## Multiline strings

    email john@doe.com
    gender male
    phone_numbers
     home 555-5555
     cell 444-4444
    biography 
     This is my bio.
     It it written on multiple lines.
     There is a space after biography above, which instructs the code that this is
     a multiline string, and not a nested Note object.
     The end.
 
Values can be multiline strings by adding a space after the name (in this case "biography") and indenting the additional lines by one space.

Very Basic Usage with Javascript in the Browser
-----------------------------------------------

1. Include the note.min.js class:

    <script type="text/javascript" src="note.min.js"></src>

2. Write some code:
    <script type="text/javascript">
      var note = new Note()
      note.name = "Breck"
      note.gender = "male"
      alert(note.toString())
    </script>

3. Run in your browser.


Some Neat Properties
--------------------

- Besides spaces and new lines, there are no syntax characters in Note.
- The difference between 2 notes is a note.
- There is no such thing as a syntax error in Note.


Extending Note
--------------

Although Note has no types and very few features, you can easily build encodings on top of Note that do have types and additional features.

For example, you could build a class called Person, that extends note, and expects age to be an integer.

We've built an encoding on top of Note called Blocks, that works as powerful template language for HTML. We've also built an encoding that can turn a full filesystem into Note and vice versa, using base64 encoding of binary data.

Limitations
-----------

## You cannot have spaces in names.

This object, with spaces in the name, cannot be represented in Note:

    { "This name has a space" : "value" }

To get around this you could rename the name, or use camelCasing or underscores instead of spaces.

## Order is not important in Note.

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

The reason for this decision was to ensure that the difference between 2 notes is itself note.


Influences
----------

Note was inspired by JSON and HAML, and our desire for a simpler, more universal object encoding with less syntax.



