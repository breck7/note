var qunit = require('qunit')

qunit.run({
    code: {

		// Include the source code
		path: './Note.js',

		// What global var should it introduce for your tests?
		namespace: 'Note'

    },
    tests: [

		// Include the test suite(s)
		'./tests/unit/Note.js'

    ]
})
