<h2>Dota 2 Parser</h2>
<h2>This is a bot which uses the discord.js library to provide users with information about anyone in their server's most recent Dota 2 match.</h2>
<h4>Usage</h4>
This bot was not originally built for public circulation and as such there isn't a command to commit your steam ID and this must be done manually.
This bot uses canvas to display the data, it buffers a .png file and embeds it as a message in the server.
<ul>
  <li>.recent -- Assuming your steam ID is in the relevant JSON list, the bot will poll the Dota 2 API and find information about your latest match and pass it to the canvas module to be displayed.</li>
  <li>.recent @USER -- Mentioning a user in the discord server will have the bot check to see if their steam ID is attached to their discord ID and make an API request for their match data instead.</li>
</ul>
