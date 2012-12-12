lint:
	gjslint src/Note.js

test:
	open tests/index.html

package:
	java -jar ~/compiler.jar --js=Note.js --js_output_file=note.min.js
	open tests/min.html

.PHONY: test build lint