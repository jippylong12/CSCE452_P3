# P3
For the 3rd project of CSCE452

TO RUN LOCALLY:
-Make sure you have node.js installed by following this tutorial:
http://blog.teamtreehouse.com/install-node-js-npm-windows
-Install the appropriate libraries with the following commands:
npm install express
npm install engine.io
npm install socket.io
-Download entire project as zip from github
-Unzip file into local directory
-Navigate to your directory you unzipeed it to and run the following command:
node server.js
-Open a browser and navigate to:
http://localhost:3000/
-Then open another browser and navigate to the same address. 
The first client connected is the "master" and the second is the slave

OPERATING THE ROBOTIC ARM
The robot is controlled by rotating each link in the robotic arm either clockwise or counterclockwise and
can be further controlled by specifying the speed of rotation.

You can control the robot by making it go left or right using the X and Y controls.

To paint, simply press the PAINT button and continue to rotate the robot arm.
The color options are shown to the left and can be selected by clicking on the color of choice.

There is also an eraser and you can change the size of the paint brush using the buttons. 

There are shortcuts to make the painting go by faster.
1 - Set Slow Speed
2 - Set Medium Speed
3 - Set Fast Speed
R - Pick Red
O - Pick Orange
Y - Pick Yellow
G - Pick Green
B - Pick Blue
P - Pick Purple
Space bar - Paint Toggle

 MASTER-SLAVE INTERACTION
 The first client connected is treated as the "master" anything it does will be
 reflected in the "slave" client. Anything the slave does will be ignored.


