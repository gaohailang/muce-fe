// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(CodeMirror) {
    "use strict";

    var tables;
    var keywords;
    var CONS = {
        QUERY_DIV: ";",
        ALIAS_KEYWORD: "AS"
    };
    var Pos = CodeMirror.Pos;

    // by siva
    var _currentTable;
    var _muceAbbrRef;
    var _muceHintFieldsRef;
    // end

    function getKeywords(editor) {
        // by siva
        var list = 'SELECT,DISTINCT,FROM,WHERE,GROUP,BY,COUNT,AND,p_date,ORDER,DESC,LIMIT,RANK,AS,SORT,DISTRIBUTE,JOIN,COLLECT_SET,ON,IF,IS,NULL,LEFT,OUTER,SEMI,UNION,ALL,IN,RIGHT,SUM,HAVING,LIKE'.split(',');
        var _ret = {};
        _.each(list, function(i) {
            _ret[i] = true;
        });
        return _ret;
        // end
    }

    function match(string, word) {
        var len = string.length;
        var sub = word.substr(0, len);
        return string.toUpperCase() === sub.toUpperCase();
    }

    function addMatches(result, search, wordlist, formatter, type) {
        // by siva
        if (!_currentTable) {
            // 匹配 abbr
        } else if (search && (type !== 'keyword')) {
            // 匹配 colId ，并且并入 result
            var matchedKeys = _.filter(_.keys(_muceHintFieldsRef[_currentTable]), function(key) {
                return match(search, key);
            });
            _.each(matchedKeys, function(kName) {
                _.each(_muceHintFieldsRef[_currentTable][kName], function(item) {
                    result.push(formatter(item));
                });
            });
        }
        // end

        for (var word in wordlist) {
            if (!wordlist.hasOwnProperty(word)) continue;
            if (Array.isArray(wordlist)) {
                word = wordlist[word];
            }
            if (match(search, word)) {
                if (type === 'keyword') {
                    result.splice(0, 0, formatter(word));
                } else {
                    result.push(formatter(word));
                }
            }
        }
    }

    function columnCompletion(result, editor) {
        var cur = editor.getCursor();
        var token = editor.getTokenAt(cur);
        var string = token.string.substr(1);
        var prevCur = Pos(cur.line, token.start);
        var table = editor.getTokenAt(prevCur).string;
        if (!tables.hasOwnProperty(table))
            table = findTableByAlias(table, editor);
        var columns = tables[table];
        if (!columns) return;
        _currentTable = table;

        addMatches(result, string, columns, function(w) {
            return "." + w;
        });
    }

    function eachWord(lineText, f) {
        if (!lineText) return;
        var excepted = /[,;]/g;
        var words = lineText.split(" ");
        for (var i = 0; i < words.length; i++) {
            f(words[i] ? words[i].replace(excepted, '') : '');
        }
    }

    function convertCurToNumber(cur) {
        // max characters of a line is 999,999.
        return cur.line + cur.ch / Math.pow(10, 6);
    }

    function convertNumberToCur(num) {
        return Pos(Math.floor(num), +num.toString().split('.').pop());
    }

    function findTableByAlias(alias, editor) {
        var doc = editor.doc;
        var fullQuery = doc.getValue();
        var aliasUpperCase = alias.toUpperCase();
        var previousWord = "";
        var table = "";
        var separator = [];
        var validRange = {
            start: Pos(0, 0),
            end: Pos(editor.lastLine(), editor.getLineHandle(editor.lastLine()).length)
        };

        //add separator
        var indexOfSeparator = fullQuery.indexOf(CONS.QUERY_DIV);
        while (indexOfSeparator != -1) {
            separator.push(doc.posFromIndex(indexOfSeparator));
            indexOfSeparator = fullQuery.indexOf(CONS.QUERY_DIV, indexOfSeparator + 1);
        }
        separator.unshift(Pos(0, 0));
        separator.push(Pos(editor.lastLine(), editor.getLineHandle(editor.lastLine()).text.length));

        //find valid range
        var prevItem = 0;
        var current = convertCurToNumber(editor.getCursor());
        for (var i = 0; i < separator.length; i++) {
            var _v = convertCurToNumber(separator[i]);
            if (current > prevItem && current <= _v) {
                validRange = {
                    start: convertNumberToCur(prevItem),
                    end: convertNumberToCur(_v)
                };
                break;
            }
            prevItem = _v;
        }

        var query = doc.getRange(validRange.start, validRange.end, false);

        for (var i = 0; i < query.length; i++) {
            var lineText = query[i];
            eachWord(lineText, function(word) {
                var wordUpperCase = word.toUpperCase();
                if (wordUpperCase === aliasUpperCase && tables.hasOwnProperty(previousWord)) {
                    table = previousWord;
                }
                if (wordUpperCase !== CONS.ALIAS_KEYWORD) {
                    previousWord = word;
                }
            });
            if (table) break;
        }
        return table;
    }

    CodeMirror.registerHelper("hint", "sql", function(editor, options) {
        tables = (options && options.tables) || {};
        // by siva
        _muceHintFieldsRef = options.muceHintFieldsRef;
        // end

        keywords = keywords || getKeywords(editor);
        var cur = editor.getCursor();
        var result = [];
        var token = editor.getTokenAt(cur),
            start, end, search;
        if (token.string.match(/^[.\w@]\w*$/)) {
            search = token.string;
            start = token.start;
            end = token.end;
        } else {
            start = end = cur.ch;
            search = "";
        }
        if (search.charAt(0) == ".") {
            columnCompletion(result, editor);
            if (!result.length) {
                while (start && search.charAt(0) == ".") {
                    token = editor.getTokenAt(Pos(cur.line, token.start - 1));
                    start = token.start;
                    search = token.string + search;
                }
                addMatches(result, search, tables, function(w) {
                    return w;
                });
            }
        } else {
            addMatches(result, search, tables, function(w) {
                return w;
            });
            addMatches(result, search, keywords, function(w) {
                return w.toUpperCase();
            }, 'keyword');
        }

        return {
            list: _.uniq(result),
            from: Pos(cur.line, start),
            to: Pos(cur.line, end)
        };
    });
})(CodeMirror);