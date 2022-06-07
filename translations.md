# Translations

The translation engine, written by me, allows you to inherit from other languages.

The engine also ignores comments and non-closed commas (this is forbidden in json by default).


## How can I inherit?
First of all, in the json file you need to create a new `__root__` key. Inside it, create a dictionary with the key `inherit` and specify the string (language code).

As a result, it should look something like this:
```json
{
	"__root__": {
		"inherit": "en"
	},
	"home": "Home",
	...
}
```


## How it works?
Before displaying the interface in the desired language, the engine checks if the language is inherited from another. 

If so, then it loads the specified language, and so on until there is no language without inheritance.

The most recent (parent) language is the bottom layer. Child languages are written on top in the order of inheritance.


## What is it for?
This allows the program not to break if new phrases are added in future updates.

If some phrases are not in your language, they will be taken from the parent.

If the parent language does not have this phrase, its code will be used.

For example, if needed the phrase `"hello_world" : "Hello World!"` Then the interface will display its key (`hello_world`).


## ⚠Warning
Please make sure you don't recurse when you inherit!
