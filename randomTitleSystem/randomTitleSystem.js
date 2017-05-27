/**
 * randomTitleSystem.js
 * 
 * Looks at the current game, and selects a random pre-defined title
 * if no titles pre-defined, does nothing, says error
 *
 * For any issues with this system, join the phantombot discord
 * (linked at the bottom of the page community.phantombot.tv)
 * and mention @WTMike24 in either the #bot-talk or #programming text channels
 *
 * This system will not affect anything other than the phantombot_titles table
 * and the current stream title. Any unwanted behaviour with other tables is
 * not a result of this system.
 */

(function () {
	/**
	 * Appends 'title' for 'game' to the game's array of titles
	 * @function addTitle
	 * @param {string} game
	 * @param {string} title
	 */
	function addTitle(game, title) {
		if (game.equalsIgnoreCase('titlemode') || game.equalsIgnoreCase('titlereset')) {
			$.say($.lang.get('randomtitlesystem.add.forbidden', game));
			return;
		}
		var currentTitles = '';
		title = String(title).replace(/\\/g, '\\\\');
		title = String(title).replace(/,/g, '\\,');
		if ($.inidb.exists('titles', game.toLowerCase())) {
			currentTitles = String(JSON.parse($.inidb.get('titles', game.toLowerCase())));
			if (currentTitles.equalsIgnoreCase("undefined")) {
				currentTitles = title;
			} else {
				currentTitles += ","+title;
			}
		} else {
			currentTitles = title;
		}
		index = unJoinFrom(currentTitles).length;
		$.inidb.set('titles', game.toLowerCase(), JSON.stringify([currentTitles]));
		$.say($.lang.get('randomtitlesystem.add.success', title, game, index-1));
	}
	/**
	 * Joins an array from a specified index with a given delimiter
	 * @function joinFrom
	 * @param {Array} array
	 * @param {Number} index
	 * @param {string} delim
	 * @returns {string}
	 */
	function joinFrom(array, index, delim) {
		var string = '';
		for (c = index; c < array.length-1; c++) {
			string += array[c]+delim;
		}
		string += array[array.length-1];
		return string;
	}
	/**
	 * Un-joins an array (for use when reading from database only)
	 * @function unJoinFrom
	 * @param {string} string
	 * @returns {Array}
	 */
	function unJoinFrom(string) {
		var min = 0;
		var array = [];
		string = String(string);
		for (c = 0; c < string.length-1; c++) {
			if (string.substring(c,c+1).equalsIgnoreCase(',')) {
				if (!string.substring(c-1,c).equalsIgnoreCase('\\') && !string.substring(c-2,c-1).equalsIgnoreCase('\\')) {
					array.push(string.substring(min,c));
					min = c+1;
				}
			}
		}
		array.push(string.substring(min));
		return array;
	}
	/**
	 * Unescapes the escape sequences put in for storing special characters (\ and ,)
	 * @function unescape
	 * @param {string} string
	 * @returns {string}
	 */
	function unescape(string) {
		string = String(string).replace(/\\,/g, ',');
		return String(string).replace(/\\\\/g, '\\');
	}
	/**
	 * Gets the current game, or 'Unknown Game' if unable to
	 * @function getGame
	 * @returns {string}
	 */
	function getGame() {
		return ($.getGame($.channelName) != '' ? $.getGame($.channelName) : "Unknown Game");
	}
	/**
	 * Gets the mode that the title system is currently using
	 * @function getMode
	 * @returns {Number}
	 */
	function getMode() {
		mode = JSON.parse($.inidb.get('titles', 'titlemode'));
		return mode;
	}
	/**
	 * Function to get a title, and set it as the current title, optionally acting on it per the mode
	 * @function getTitle
	 * @param {string} sender
	 */
	function getTitle(sender) {
		game = getGame();
		if (game.equalsIgnoreCase("unknown game")) {
			$.say($.lang.get('randomtitlesystem.use.unknown',game));
			return;
		} else if (!$.inidb.exists('titles', game.toLowerCase())) {
			$.say($.lang.get('randomtitlesystem.use.unknown',game));
			return;
		}
		currentTitles = JSON.parse($.inidb.get('titles', game.toLowerCase()));
		list = unJoinFrom(currentTitles);
		if (list[0].equalsIgnoreCase("undefined")) {
			$.say($.lang.get('randomtitlesystem.use.empty', game) + (getMode() == 2 ? $.lang.get('randomtitlesystem.use.empty2') : ''));
			return;
		}
		randomIndex = $.rand(list.length);
		randomIndex = randomIndex > list.length ? randomIndex-1 : randomIndex;
		$.say("Title for " + game + ": " + unescape(list[randomIndex]));
		$.updateStatus($.channelName, unescape(list[randomIndex]), sender, true);

		if (getMode() == 2) {
			removeTitle = list[randomIndex];
			postRemoved = removeAtIndex(list, randomIndex);
			removedTitles = '';
			if ($.inidb.exists('titles', game.toLowerCase()+'-used')) {
				removedTitles = JSON.parse($.inidb.get('titles', game.toLowerCase()+'-used'));
				removedTitles += ","+removeTitle;
			} else {
				removedTitles = removeTitle;
			}
			$.inidb.set('titles', game.toLowerCase()+'-used', JSON.stringify([removedTitles]));
			$.inidb.set('titles', game.toLowerCase(), JSON.stringify([joinFrom(postRemoved,0,',')]));
		} else if (getMode() == 3) {
			postRemoved = removeAtIndex(list, randomIndex);
			$.inidb.set('titles', game.toLowerCase(), JSON.stringify([joinFrom(postRemoved,0,',')]));
		}
	}
	/**
	 * Reloads the 'used' titles for a specified game back into the active list
	 * @function reloadTitle
	 * @param {string} game
	 */
	function reloadTitle(game) {
		if (!$.inidb.exists('titles', game.toLowerCase())) {
			$.say($.lang.get('randomtitlesystem.title.404', game));
			return;
		} else if (!$.inidb.exists('titles', game.toLowerCase()+'-used')) {
			$.say($.lang.get('randomtitlesystem.reload.404', game)+(getMode() != 2 ? $.lang.get('randomtitlesystem.reload.4042', String(getMode())) : ''));
			return;
		} else if (String(JSON.parse($.inidb.get('titles', game.toLowerCase()+'-used'))).equalsIgnoreCase("undefined")) {
			$.say($.lang.get('randomtitlesystem.reload.404', game)+(getMode() != 2 ? $.lang.get('randomtitlesystem.reload.4042', String(getMode())) : ''));
			return;
		}
		usedTitles = JSON.parse($.inidb.get('titles', game.toLowerCase()+'-used'));
		usedList = unJoinFrom(usedTitles);
		currentTitles = JSON.parse($.inidb.get('titles', game.toLowerCase()));
		currentList = unJoinFrom(currentTitles);
		max = usedList.length;
		for (c = 0; c < max; c++) {
			currentList.push(usedList.pop());
		}

		newTitles = joinFrom(currentList, 0, ',');
		$.inidb.set('titles', game.toLowerCase(), JSON.stringify([newTitles]));
		$.inidb.set('titles', game.toLowerCase()+'-used', JSON.stringify([joinFrom(usedList, 0, ',')]));
	}
	/**
	 * Removes an item at the specified index in an array, and returns the array without that item
	 * @function removeAtIndex
	 * @param {Array} array
	 * @param {Number} index
	 * @returns {Array}
	 */
	function removeAtIndex(array, index) {
		array.splice(index,1);
		return array;
	}
	/**
	 * Replaces an item at the specified index in an array with a new item and returns it
	 * @function replaceAtIndex
	 * @param {Array} array
	 * @param {Number} index
	 * @param {string} newElement
	 * @returns {Array}
	 */
	function replaceAtIndex(array, index, newElement) {
		array.splice(index, 1, newElement);
		return array;
	}
	/**
	 * Deletes a title from the stored array in the database
	 * @function deleteTitle
	 * @param {string} game
	 * @param {Number} index
	 */
	function deleteTitle(game, index) {
		if (!$.inidb.exists('titles', game.toLowerCase())) {
			$.say($.lang.get('randomtitlesystem.title.404', game));
			return;
		}
		currentTitles = JSON.parse($.inidb.get('titles', game.toLowerCase()));
		currentList = unJoinFrom(currentTitles);
		/*if (index.equalsIgnoreCase('all')) {
			$.say($.lang.get('randomtitlesystem.delete.all', game));
			$.inidb.RemoveKey('title', '', game);
			if ($.inidb.exists('titles', game.toLowerCase()+'-used')) {
				$.inidb.RemoveKey('title', '', game+'-used');
			}
		}*/
		if (index > currentList.length-1) {
			$.say($.lang.get('randomtitlesystem.query.oob', index, game, currentList.length-1));
			return;
		}
		$.say($.lang.get('randomtitlesystem.delete.success', index, game))
		postRemoved = removeAtIndex(currentList, index);
		$.inidb.set('titles', game.toLowerCase(), JSON.stringify([joinFrom(postRemoved,0,',')]));
	}
	/**
	 * Updates a title in the database at a specified index to a new title
	 * @function titleUpdate
	 * @param {string} game
	 * @param {Number} index
	 * @param {string} newTitle
	 */
	function titleUpdate(game, index, newTitle) {
		if (!$.inidb.exists('titles', game.toLowerCase())) {
			$.say($.lang.get('randomtitlesystem.title.404', game));
			return;
		}
		currentTitles = JSON.parse($.inidb.get('titles', game.toLowerCase()));
		currentList = unJoinFrom(currentTitles);
		if (index > currentList.length-1) {
			$.say($.lang.get('randomtitlesystem.query.oob', index, game, currentList.length-1));
			return;
		}
		oldTitle = currentList[index];
		newList = replaceAtIndex(currentList, index, newTitle);

		newTitles = joinFrom(newList, 0, ',');
		$.inidb.set('titles', game.toLowerCase(), JSON.stringify([newTitles]));

		$.say($.lang.get('randomtitlesystem.update.success', oldTitle, index, newTitle, game));
		return;
	}
	/**
	 * Queries the database for a certain game and displays the specified title
	 * @function titleQuery
	 * @param {string} game
	 * @param {Number} index
	 */
	function titleQuery(game, index) {
		if (!$.inidb.exists('titles', game.toLowerCase())) {
			$.say($.lang.get('randomtitlesystem.title.404', game));
			return;
		}
		var message = '';
		currentTitles = JSON.parse($.inidb.get('titles', game.toLowerCase()));
		currentList = unJoinFrom(currentTitles);
		if (index.equalsIgnoreCase("all")) {
			for (c = 0; c < currentList.length-1; c++) {
				message += '#'+String(c)+': '+currentList[c]+', ';
			}
			message += '#'+String(currentList.length-1)+': '+currentList[currentList.length-1]+'.';
			if ($.inidb.exists('titles', game.toLowerCase()+'-used')) {
				usedTitles = JSON.parse($.inidb.get('titles', game.toLowerCase()+'-used'));
				usedList = unJoinFrom(usedTitles);
				message += 'Used titles: ';
				for (c = 0; c < usedList.length-1; c++) {
					message += '#'+String(c)+': '+usedList[c]+', ';
				}
				message += '#'+String(usedList.length-1)+': '+usedList[usedList.length-1]+'. ';
				message += 'Reload the used titles and run this command again to delete/modify them.';
			}
			$.say($.lang.get('randomtitlesystem.query.all', game, message));
			return;
		} else {
			if (index > currentList.length-1) {
				$.say($.lang.get('randomtitlesystem.query.oob', index, game, currentList.length-1));
				return;
			}	
			$.say($.lang.get('randomtitlesystem.query.single', index, game, currentList[index]));
			return;
		}
	}
	/**
	 * @event command
	 */
	$.bind('command',function(event) {
		var sender = event.getSender(),
			command = event.getCommand(),
			args = event.getArgs();

		if (command.equalsIgnoreCase("addtitle")) {
			if (args.length == 1) {
				if (args[0].equalsIgnoreCase("example")) {
					$.say($.lang.get('randomtitlesystem.add.example'));
				} else {
					$.say($.lang.get('randomtitlesystem.add.usage'));
				}
				return;
			} else if (args.length < 2) {
				$.say($.lang.get('randomtitlesystem.add.usage'));
				return;
			}
			addTitle(args[0].equalsIgnoreCase('this') ? getGame() : args[0],joinFrom(args,1,' '));
		} else if (command.equalsIgnoreCase("randomtitle") || command.equalsIgnoreCase("usetitle")) {
			getTitle(sender);
		} else if (command.equalsIgnoreCase("deltitle")) {
			if (args.length < 2) {
				$.say($.lang.get('randomtitlesystem.delete.usage'));
				return;
			}
			deleteTitle(args[0].equalsIgnoreCase('this') ? getGame() : args[0], args[1]);

		} else if (command.equalsIgnoreCase("titlequery")) {
			if (args.length < 2) {
				$.say($.lang.get('randomtitlesystem.query.usage'));
				return;
			}
			titleQuery(args[0].equalsIgnoreCase('this') ? getGame() : args[0], args[1]);

		} else if (command.equalsIgnoreCase("updatetitle")) {
			if (args.length < 3) {
				if (args.length > 0) {
					if (args[0].equalsIgnoreCase("example")) {
						$.say($.lang.get('randomtitlesystem.update.example'));
					}
					return;
				}
				$.say($.lang.get('randomtitlesystem.update.usage'));
				return;
			}
			titleUpdate(args[0].equalsIgnoreCase('this') ? getGame() : args[0], args[1], joinFrom(args, 2, ' '));
		} else if (command.equalsIgnoreCase("titlemode")) {
			//1) Keep title in list (default)
			//2) Move title to used (requires reload command to bring back)
			//3) Delete title on use
			if (args.length < 1) {
				$.say($.lang.get('randomtitlesystem.mode.usage'));
				return;
			}
			if (args[0].equalsIgnoreCase("status")) {
				$.say($.lang.get('randomtitlesystem.mode.show'+String(getMode())));
			} else if (args[0].equalsIgnoreCase("set")) {
				if (Number(args[1]) > 0 && Number(args[1]) < 4) {
					$.inidb.set('titles', 'titlemode', JSON.stringify([String(args[1])]));
					$.say($.lang.get('randomtitlesystem.mode.success', String(args[1])));
				} else {
					$.say($.lang.get('randomtitlesystem.mode.failure', String(args[1])));
				}
			} else if (args[0].equalsIgnoreCase("list")) {
				$.say($.lang.get('randomtitlesystem.mode.list'));
			} else if (args[0].equalsIgnoreCase("info")) {
				$.say($.lang.get('randomtitlesystem.mode.info'));
			}
		} else if (command.equalsIgnoreCase("titlereload") || command.equalsIgnoreCase("reloadtitle")) {
			if (args.length < 1) {
				$.say($.lang.get('randomtitlesystem.reload.usage'));
				return;
			}
			game = args[0].equalsIgnoreCase("this") ? getGame() : joinFrom(args,0,' ');
			reloadTitle(game);
		} else if (command.equalsIgnoreCase("titlereset")) {
			if (!sender.equalsIgnoreCase($.channelName.toLowerCase())) {
				$.say($.lang.get('randomtitlesystem.reset.forbidden'));
				return;
			}
			resetStatus = unJoinFrom(JSON.parse($.inidb.get('titles', 'titlereset')));
			if (resetStatus[0] == 0) {
				verifyMe = $.trueRandRange(100,999);
				$.inidb.set('titles', 'titlereset', JSON.stringify(String(verifyMe)+','+String(0)));
				$.say($.lang.get('randomtitlesystem.reset.verify', verifyMe));
			} else if (String(args[0]).length > 7) {
				$.log.error("GREATER THAN 7" + args[0]);
				if (args[0].substring(0,7).equalsIgnoreCase('confirm')) {
					$.log.error("STARTSWITH CONFIRM");
					if (args[0].equalsIgnoreCase('confirm'+String(resetStatus[0]))) {
						$.inidb.RemoveFile('titles');
						$.say($.lang.get('randomtitlesystem.reset.success'));
						$.inidb.set('titles', 'titlemode', JSON.stringify(String(1)));
						$.inidb.set('titles', 'titlereset', JSON.stringify(String(0)+','+String(0)));
					} else {
						if (resetStatus[1] == 0) {
							$.inidb.set('titles', 'titlereset', JSON.stringify(String(resetStatus[0])+','+String(1)));
							$.say($.lang.get('randomtitlesystem.reset.invalid', args[0].substring(7)));
						} else if (resetStatus[1] == 1) {
							$.inidb.set('titles', 'titlereset', JSON.stringify(String(0)+','+String(0)));
							$.say($.lang.get('randomtitlesystem.reset.declined'));
						}
					}
				}
			} else if (args[0].equalsIgnoreCase("decline")) {
				$.say($.lang.get('randomtitlesystem.reset.declined'));
				$.inidb.set('titles', 'titlereset', JSON.stringify(String(0)+','+String(0)));
			} else {
				$.log.error("WHY ARE WE AT THE ELSE??");
				$.log.error("COMMAND: " + command + "ARGS: " + String(args[0]));
			}
		}
	});
	/**
	 * @event initReady
	 */
	$.bind('initReady',function() {
		if (!$.inidb.exists('titles', 'titlemode')) {
			$.inidb.set('titles', 'titlemode', JSON.stringify(String(1)));
		}
		$.inidb.set('titles', 'titlereset', JSON.stringify(String(0)+','+String(0)));	

		$.registerChatCommand('./systems/randomTitleSystem.js', 'addtitle', 2);
		$.registerChatCommand('./systems/randomTitleSystem.js', 'randomtitle', 2);
		$.registerChatCommand('./systems/randomTitleSystem.js', 'usetitle', 2);
		$.registerChatCommand('./systems/randomTitleSystem.js', 'deltitle', 2);
		$.registerChatCommand('./systems/randomTitleSystem.js', 'updatetitle', 2);
		$.registerChatCommand('./systems/randomTitleSystem.js', 'titlemode', 2);
		$.registerChatCommand('./systems/randomTitleSystem.js', 'titlereload', 2);
		$.registerChatCommand('./systems/randomTitleSystem.js', 'reloadtitle', 2);
		$.registerChatCommand('./systems/randomTitleSystem.js', 'titlequery', 2);
		$.registerChatCommand('./systems/randomTitleSystem.js', 'titlereset', 2);
	});
})();