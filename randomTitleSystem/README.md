## randomTitleSystem

###### About this system

Have you ever come up with some really good titles for your stream, but already had one set? Well with this system you can save those titles for future use! It is [somewhat] simple to use and has a reset function if you want to start clean.

###### Requirements

Developed and tested on PhantomBot version 2.3.6.1

https://github.com/WTMike24/PhantomBotSystems/blob/master/randomTitleSystem/randomTitleSystem.js
Save randomTitleSystem.js to `phantombot/scripts/systems/randomTitleSystem.js`

https://github.com/WTMike24/PhantomBotSystems/blob/master/randomTitleSystem/systems-randomTitleSystem.js
Save systems-randomTitleSystem.js to `phantombot/scripts/lang/english/systems/systems-randomTitleSystem.js`

No additional dependencies required

###### Commands

All commands default to mod-level or higher, to change this, open `randomTitleSystem.js` and change the 2s at the very bottom to your desired permission level (do !permissions in chat for a list)

Note: For multi-word titles, use quotes around the name. e.g. "Metro 2033".
	  You can use 'this' as an abbreviation for the game currently being played.
	  IDs start counting with 0, so the first title is 0, the second is 1, etc...

- !addtitle [game] [title]
	- Adds [title] to [game]'s list of stored titles.
	- Example: !addtitle "Metro 2033" Getting Spooped in the Metro
- !usetitle or !randomtitle
	- Both perform the same operation, they randomly select a title from the current game and set it as the current title for the stream.
	- Example: !usetitle
- !titlequery [game] [title ID]
	- Searches through [game]'s list of titles and displays the one with the specified ID, or all of them if 'all' is used instead
	- Example: !titlequery "Metro 2033" 2
- !updatetitle [game] [title ID] [newTitle]
	- Updates the title at the specified index (ID) with the new title for the specified game
	- Example: !updatetitle "Metro 2033" 0 Who Says Metro is Hard
- !deltitle [game] [title ID]
	- Deletes a title based on its ID from the specified game's list
	- Example: !deltitle "Metro 2033" 2
- !titlemode [mode]
	-Sets the mode for the title system, they are as follows:
	1. After the title is selected, leave it in the active list (default)
	2. After the title is selected, move it to a 'used' list so it is not selected again
	3. After the title is selected, permanently delete the title from the database
	- Example: !titlemode 2
- !titlereload [game] or !reloadtitle [game]
	- Reloads the titles from the specified game's 'used' list back to the active list, only necessary when you are using mode 2
	- Example: !titlereload "Metro 2033"

- !titlereset
	- The only command that can only be run by the channel owner no matter the permission level specified. When run, it asks for confirmation that you want to reset everything for this system by generating a random 3 digit code you must retype to confirm you really want to clear everything. This is irreversible unless you backup your phantombot.db regularly.

###### Contact

If you have any issues with this system, don't hesitate to contact me by joining the phantombot discord channel (linked at the bottom of https://community.phantombot.tv) and mention @WTMike24