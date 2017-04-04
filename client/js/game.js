   //-----------------------------------------------------------------------------
    //Global Variables
    //-----------------------------------------------------------------------------

   //TDP STUFF
    var socket;
    var masterBool = false;
    //controls
    var cursors;

    //background images
    var controlPanelBackground;
    var controlPanelText;

    //robot sprites
    var baseOfChampions;
    var easel;
    var link1;
    var link2;
    var link3;

    //end Effector position coords (didnt want to map to sprite)
    var endEffectorX = 0;
    var endEffectorY = 0;

    //buttons
    var joint1_clockwise;
    var joint1_ccw;

    var joint2_clockwise;
    var joint2_ccw;

    var joint3_clockwise;
    var joint3_ccw;

    //World mode control
    var posX_WMC;
    var negX_WMC;

    var posY_WMC;
    var negY_WMC;

    var xPos;
    var yPos;

    //handles painting
    var paintButton;
    var graphics;

    //angle values
    var angle1=-90;
    var angle2=0;
    var angle3=0;

    // joints
    var joint1 = math.matrix([0,0,0,1]);
    var joint2 = math.matrix([0,0,0,1]);
    var joint3 = math.matrix([0,0,0,1]);
    var joint4 = math.matrix([0,0,0,1]);

    //detertimines whether to paint or not
    var paintToggle = false;
    var Paintcolor;
    var PaintSize = 10;
    var eraseToggle = false;

    var rotationSpeed;
    var incAmt = 3;

    var isMaster = false;

    //-----------------------------------------------------------------------------
    //Kinematics Functions
    //-----------------------------------------------------------------------------

    //helper function to convert from degrees to radians
    function degToRad(degrees){
        return degrees*math.PI/180;
    }

    function radToDeg(radians){
        return (radians*180)/math.PI
    }

    // Calculate the transformation matrix for the link2 axis position (theta is in rads)
    function transAxis1(theta1, theta2){
        var the1 = degToRad(theta1);
        var the2 = degToRad(theta2);

        //has to be redone each time because theta is constantly changing
        var world_translation = math.matrix([[1,0,0,582],[0,1,0,654],[0,0,1,0],[0,0,0,1]]); //translation from world frame to base frame
        var transform_matrix1 = math.matrix([[math.cos(the1), -math.sin(the1), 0, 0],   [math.sin(the1), math.cos(the1), 0, 0], [0,0,1,0], [0,0,0,1]]);
        var transform_matrix2 = math.matrix([[math.cos(the2), -math.sin(the2), 0, 150], [math.sin(the2), math.cos(the2), 0, 0], [0,0,1,0], [0,0,0,1]]);

        var transform_matrix = math.multiply(world_translation,transform_matrix1);
        transform_matrix = math.multiply(transform_matrix,transform_matrix2);

        return transform_matrix;
    }

    // Calculate the transformation matrix for the link3 axis position (theta is in rads)
    function transAxis2(theta1, theta2, theta3){
        var the1 = degToRad(theta1);
        var the2 = degToRad(theta2);
        var the3 = degToRad(theta3);

        var world_translation = math.matrix([[1,0,0,582],[0,1,0,654],[0,0,1,0],[0,0,0,1]]); //translation from world frame to base frame
        var transform_matrix1 = math.matrix([[math.cos(the1), -math.sin(the1), 0, 0],   [math.sin(the1), math.cos(the1), 0, 0], [0,0,1,0], [0,0,0,1]]);
        var transform_matrix2 = math.matrix([[math.cos(the2), -math.sin(the2), 0, 150], [math.sin(the2), math.cos(the2), 0, 0], [0,0,1,0], [0,0,0,1]]);
        var transform_matrix3 = math.matrix([[math.cos(the3), -math.sin(the3), 0, 100], [math.sin(the3), math.cos(the3), 0, 0], [0,0,1,0], [0,0,0,1]]);

        var temp_matrix  = math.multiply(world_translation, transform_matrix1);
        var temp_matrix2 = math.multiply(transform_matrix2, transform_matrix3);

        return math.multiply(temp_matrix, temp_matrix2);

    }

    // Calculate the transformation matrix for the end effector position (theta is in rads)
    function transAxis3(theta1, theta2, theta3){
        theta1 = degToRad(theta1);
        theta2 = degToRad(theta2);
        theta3 = degToRad(theta3);

        var world_translation = math.matrix([[1,0,0,582],[0,1,0,654],[0,0,1,0],[0,0,0,1]]); //translation from world frame to base frame
        var transform_matrix1 = math.matrix([[math.cos(theta1), -math.sin(theta1), 0, 0], [math.sin(theta1),   math.cos(theta1), 0, 0], [0,0,1,0], [0,0,0,1]]);
        var transform_matrix2 = math.matrix([[math.cos(theta2), -math.sin(theta2), 0, 150], [math.sin(theta2), math.cos(theta2), 0, 0], [0,0,1,0], [0,0,0,1]]);
        var transform_matrix3 = math.matrix([[math.cos(theta3), -math.sin(theta3), 0, 100], [math.sin(theta3), math.cos(theta3), 0, 0], [0,0,1,0], [0,0,0,1]]);
        var transform_matrix4 = math.matrix([[1, 0, 0, 75], [0, 1, 0, 0], [0,0,1,0], [0,0,0,1]]);

        //unfortunately only supports multiplying two matricies at a time
        var temp_matrix  = math.multiply(world_translation, transform_matrix1);
        temp_matrix = math.multiply(temp_matrix, transform_matrix2);
        temp_matrix = math.multiply(temp_matrix, transform_matrix3);
        temp_matrix = math.multiply(temp_matrix, transform_matrix4);

        return temp_matrix;
    }

    //called everytime world control buttons are updated
    function inverseKinSolver(xp, yp){
        console.log("xp: "+xp);
        console.log("yp: "+yp);
        //say if coordinate xp, yp is out of radius range then throw out, otherwise update!
        var baseX = 582;
        var baseY = 654;
        var Xp = xp -582;
        var Yp = baseY-yp;
        var r = 150+100+75;
        var d = math.sqrt((xp-baseX)*(xp-baseX) + (yp-baseY)*(yp-baseY));
        console.log("d: "+d);
        if(d <= r){

            var crossTheta = degToRad(angle1+angle2+angle3);
            //perform inverse kinematics equations here
            var lx = Xp - 75*math.cos(crossTheta);
            var ly = Yp + 75*math.sin(crossTheta); // it is + because to go down we must add, -4 for some error correction
            var l = math.round(math.sqrt(lx*lx + ly*ly),0);
            if(l > 250)
            {
                console.log("Out of Range!");
                return 0;
            }

            var q = (l*l - 150*150 -100*100)/(2*150*100);
            var theta2 = math.acos(q);

            var lambda1 = math.atan2(150+100*math.cos(theta2),100*math.sin(theta2));
            var lambda2 = math.atan2(lx,ly);

            var theta1 = lambda1 + lambda2;
            var theta3 = crossTheta - (theta1+theta2);


            //now update global angles and call updateSprites()
            angle1 = radToDeg(theta1) + 180;
            angle2 = radToDeg(theta2);
            angle3 = radToDeg(theta3) + 180;

            var angles = [angle1,angle2,angle3];

            //socket.emit('angles', angles);

            updateSprites();
            return 1;
        }
        else
        {
            console.log("HERE1: "+" l, "+l+" , "+math.sqrt(1-q*q));
            console.log("Out of Range!");
            return 0;
        }
    }

    //wrapper function for axis calculations and rotations
    function updateSprites(){

        var world_translation = math.matrix([[1,0,0,582],[0,1,0,654],[0,0,1,0],[0,0,0,1]]); //translation from world frame to base frame

        var link1t = math.multiply(world_translation, joint1);

        link1.x = link1t.get([0]);
        link1.y = link1t.get([1]);

        //link2t(emp) describes transform operator to move the link2 axis to a new position
        var link2t = math.multiply(transAxis1(angle1, angle2), joint2); //angles are global and controlled by buttons

        //after calculation do assignment to sprite position
        link2.x = link2t.get([0]);
        link2.y = link2t.get([1]);

        //same transform for link3 axis
        var link3t = math.multiply(transAxis2(angle1, angle2, angle3), joint3);

        link3.x = link3t.get([0]);
        link3.y = link3t.get([1]);

        //same transform for endEffector
        var EEt = math.multiply(transAxis3(angle1, angle2, angle3), joint4);

        endEffectorX = math.round(EEt.get([0]),0);
        endEffectorY = math.round(EEt.get([1]),0);

        //adjusting angle to make sure orientation matches as expected
        link1.angle = angle1;
        link2.angle = angle1 + angle2;
        link3.angle = angle1 + angle2 + angle3;

        //if paint is on paint at end effector
        if(paintToggle == true){
            //if paint button is pressed:
            graphics.beginFill(Paintcolor, 1); //red circle
            graphics.drawCircle(endEffectorX, endEffectorY, PaintSize); //x, y, diam
        }
        else if(eraseToggle == true){
            //if erase button is pressed:
            graphics.beginFill(0xEFEFEF, 1); //red circle
            graphics.drawCircle(endEffectorX, endEffectorY, PaintSize+1); //x, y, diam
            graphics.drawCircle(endEffectorX, endEffectorY, 10); //x, y, diam

        }
        
        game.world.bringToTop(link1);
        game.world.bringToTop(baseOfChampions);
        game.world.bringToTop(link2);
        game.world.bringToTop(link3);

        var data = {angle1: angle1, angle2: angle2, angle3: angle3, paint: paintToggle, rotation: rotationSpeed, color: Paintcolor };

        if(isMaster) {
            console.log("emitting data to slave");
            socket.emit('world data', data);
        }
		/*else {
            console.log('checking for update');

            socket.on('update_vars', function(data){

                console.log('updating world variables from master');

                angle1 = data.angle1;
                angle2 = data.angle2;
                angle3 = data.angle3;
            });
        }*/

    }

    function initialize_socket(){
		console.log("In initialize_socket");
        socket = io.connect();

        socket.emit('join', function(msg){
           isMaster = msg;

           console.log('master boolean: ' + isMaster);
        });

        socket.on('master', function(master){
            console.log("received master is: " + master);
            isMaster = master;
        })
    }
    //-----------------------------------------------------------------------------
    //Phaser Game Functionality
    //-----------------------------------------------------------------------------

    //mapping phaser game to var
    var game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update, render:render });

    window.socket = null;
    
    initialize_socket();

    console.log("Is Master is " + isMaster);

    //preload assets needed for game
    function preload() {
        //load assets

        //Assets for buttons
        game.load.spritesheet('joint1_clockwise','assets/arrow_rotate_clockwise_spritesheet.png',75,75,2);
        game.load.spritesheet('joint1_ccw','assets/arrow_rotate_counterclockwise_spritesheet.png',75,75,2);

        game.load.spritesheet('joint2_clockwise','assets/arrow_rotate_clockwise_spritesheet.png',75,75,2);
        game.load.spritesheet('joint2_ccw','assets/arrow_rotate_counterclockwise_spritesheet.png',75,75,2);

        game.load.spritesheet('joint3_clockwise','assets/arrow_rotate_clockwise_spritesheet.png',75,75,2);
        game.load.spritesheet('joint3_ccw','assets/arrow_rotate_counterclockwise_spritesheet.png',75,75,2);

        game.load.spritesheet('paint', 'assets/Paint.png',250,250,2);
        game.load.spritesheet('eraser', 'assets/eraser.png',234,78,1);

        //colors
        game.load.spritesheet('color_red','assets/colors/red.png',100,100,2);
        game.load.spritesheet('color_orange','assets/colors/orange.png',100,100,2);
        game.load.spritesheet('color_yellow','assets/colors/yellow.png',100,100,2);
        game.load.spritesheet('color_green','assets/colors/green.png',100,100,2);
        game.load.spritesheet('color_blue','assets/colors/blue.png',100,100,2);
        game.load.spritesheet('color_purple','assets/colors/purple.png',100,100,2);

        //sizes
        game.load.spritesheet('size_small', 'assets/small_button.png',100,40,2);
        game.load.spritesheet('size_medium', 'assets/medium_button.png',100,40,2);
        game.load.spritesheet('size_large', 'assets/large_button.png',100,40,2);

        //background
        game.load.image('controlPanelBackground','assets/controlPanelBackground.png');
        game.load.image('brushSizeBackground','assets/brush_size_bg.png');
        game.load.image('easel','assets/easel.png');

        //base and links
        game.load.image('baseOfChampions','assets/baseOfChampions.png');
        game.load.image('link1','assets/link1.png');
        game.load.image('link2','assets/link2.png');
        game.load.image('link3','assets/link3.png');

        //rotation speed
        game.load.spritesheet( 'fast', 'assets/speed_fast.png', 100, 65, 2 );
        game.load.spritesheet( 'medium', 'assets/speed_medium.png', 100, 65, 2);
        game.load.spritesheet( 'slow', 'assets/speed_slow.png', 100, 65, 2);
    }

    //actually add assets in appropriate position, also set anchors for rotation axis references
    function create() {
        //set background color
        game.stage.backgroundColor = '#5cb2e0';

        easel = game.add.sprite(game.world.centerX-60, game.world.centerY-50, 'easel');
        easel.anchor.x = 0.5;
        easel.anchor.y = 0.5;

        controlPanelBackground = game.add.sprite(game.world.centerX + 250,0,'controlPanelBackground');
        controlPanelText = game.add.text(game.world.centerX + 470, 10, "Control Panel", { font: "24px Arial", fill: "#7810B7", align: "center" });

        brushSizeBackground = game.add.sprite(18, 450, 'brushSizeBackground');

        if(isMaster){
            //Rotation speed
            game.add.text(game.world.centerX + 275, 10, "Rotation Speed", { font: "24px Arial", fill: "#7810B7", align: "center" });
            game.add.button(game.world.centerX + 300, 250, 'fast', speedFast, this, 0, 0, 1, 0);
            game.add.button(game.world.centerX + 300, 150, 'medium', speedMedium, this, 0, 0, 1, 0);
            game.add.button(game.world.centerX + 300,  50, 'slow', speedSlow, this, 0, 0, 1, 0);

            //world mode control
            //text labels
            game.add.text(game.world.centerX + 375, game.world.height - 350, "-X", { font: "24px Arial", fill: "#7810B7", align: "center" });
            game.add.text(game.world.centerX + 375, game.world.height - 250, "-Y", { font: "24px Arial", fill: "#7810B7", align: "center" });
            game.add.text(game.world.centerX + 520, game.world.height - 350, "+X", { font: "24px Arial", fill: "#7810B7", align: "center" });
            game.add.text(game.world.centerX + 520, game.world.height - 250, "+Y", { font: "24px Arial", fill: "#7810B7", align: "center" });

            //buttons
            game.add.button(game.world.centerX + 470,  game.world.height - 320, 'slow', posX_WMCF, this, 0, 0, 1, 0);
            posY_WMC = game.add.button(game.world.centerX + 540,  game.world.height - 170, 'slow', posY_WMCF, this, 0, 0, 1, 0);
            negX_WMC = game.add.button(game.world.centerX + 400,  game.world.height - 290, 'slow', negX_WMCF, this, 0, 0, 1, 0);
            negY_WMC = game.add.button(game.world.centerX + 390,  game.world.height - 215, 'slow', negY_WMCF, this, 0, 0, 1, 0);

            //flip these buttons
            negX_WMC.anchor.setTo(0.5, 0.5);
            negY_WMC.anchor.setTo(0.5, 0.5);
            posY_WMC.anchor.setTo(0.5, 0.5);
            negX_WMC.angle = 180;
            negY_WMC.angle = 90;
            posY_WMC.angle = 270;

            //link text
            game.add.text(game.world.centerX + 440, 75, "L1:", { font: "24px Arial", fill: "#7810B7", align: "center" });
            game.add.text(game.world.centerX + 440, 175, "L2:", { font: "24px Arial", fill: "#7810B7", align: "center" });
            game.add.text(game.world.centerX + 440, 275, "L3:", { font: "24px Arial", fill: "#7810B7", align: "center" });

            //buttons
            joint1_clockwise = game.add.button(game.world.centerX + 565, 50, 'joint1_clockwise', actionJoint1Clockwise, this, 0,0,1,0);
            joint1_ccw = game.add.button(game.world.centerX + 475, 50, 'joint1_ccw', actionJoint1Ccw, this, 0,0,1,0);

            joint2_clockwise = game.add.button(game.world.centerX + 565, 150, 'joint2_clockwise', actionJoint2Clockwise, this, 0,0,1,0);
            joint2_ccw = game.add.button(game.world.centerX + 475, 150, 'joint2_ccw', actionJoint2Ccw, this, 0,0,1,0);

            joint3_clockwise = game.add.button(game.world.centerX + 565, 250, 'joint3_clockwise', actionJoint3Clockwise, this,  0,0,1,0);
            joint3_ccw = game.add.button(game.world.centerX + 475, 250, 'joint3_ccw', actionJoint3Ccw, this, 0,0,1,0);

            paintButton = game.add.button(game.world.centerX + 400, game.world.height - 175, 'paint', actionPaint, this, 0,0,1,0);

            game.add.button(18, 360, 'eraser', actionErase, this, 0,0,1,0);

            game.add.button(30, 30, 'color_red', selectRed, this, 0,0,1,0);
            game.add.button(140,30, 'color_orange', selectOrange, this, 0,0,1,0);
            game.add.button(30,140, 'color_yellow', selectYellow, this, 0,0,1,0);
            game.add.button(140,140, 'color_green', selectGreen, this, 0,0,1,0);
            game.add.button(30,250, 'color_blue', selectBlue, this, 0,0,1,0);
            game.add.button(140,250, 'color_purple', selectPurple, this, 0,0,1,0);

            game.add.button(35, 520, 'size_small', selectSmall, this, 0, 0, 1, 0);
            game.add.button(105, 560, 'size_medium', selectMedium, this, 0, 0, 1, 0);
            game.add.button(35, 600, 'size_large', selectLarge, this, 0, 0, 1, 0);
        }
        else {
            //Rotation speed
            game.add.text(game.world.centerX + 275, 10, "Rotation Speed", { font: "24px Arial", fill: "#7810B7", align: "center" });
            game.add.button(game.world.centerX + 300, 250, 'fast', noAction, this, 0, 0, 1, 0);
            game.add.button(game.world.centerX + 300, 150, 'medium', noAction, this, 0, 0, 1, 0);
            game.add.button(game.world.centerX + 300,  50, 'slow', noAction, this, 0, 0, 1, 0);

            //world mode control
            //text labels
            game.add.text(game.world.centerX + 375, game.world.height - 350, "-X", { font: "24px Arial", fill: "#7810B7", align: "center" });
            game.add.text(game.world.centerX + 375, game.world.height - 250, "-Y", { font: "24px Arial", fill: "#7810B7", align: "center" });
            game.add.text(game.world.centerX + 520, game.world.height - 350, "+X", { font: "24px Arial", fill: "#7810B7", align: "center" });
            game.add.text(game.world.centerX + 520, game.world.height - 250, "+Y", { font: "24px Arial", fill: "#7810B7", align: "center" });

            //buttons
            game.add.button(game.world.centerX + 470,  game.world.height - 320, 'slow', noAction, this, 0, 0, 1, 0);
            posY_WMC = game.add.button(game.world.centerX + 540,  game.world.height - 170, 'slow', noAction, this, 0, 0, 1, 0);
            negX_WMC = game.add.button(game.world.centerX + 400,  game.world.height - 290, 'slow', noAction, this, 0, 0, 1, 0);
            negY_WMC = game.add.button(game.world.centerX + 390,  game.world.height - 215, 'slow', noAction, this, 0, 0, 1, 0);

            //flip these buttons
            negX_WMC.anchor.setTo(0.5, 0.5);
            negY_WMC.anchor.setTo(0.5, 0.5);
            posY_WMC.anchor.setTo(0.5, 0.5);
            negX_WMC.angle = 180;
            negY_WMC.angle = 90;
            posY_WMC.angle = 270;


            //link text
            game.add.text(game.world.centerX + 440, 75, "L1:", { font: "24px Arial", fill: "#7810B7", align: "center" });
            game.add.text(game.world.centerX + 440, 175, "L2:", { font: "24px Arial", fill: "#7810B7", align: "center" });
            game.add.text(game.world.centerX + 440, 275, "L3:", { font: "24px Arial", fill: "#7810B7", align: "center" });

            //buttons
            joint1_clockwise = game.add.button(game.world.centerX + 565, 50, 'joint1_clockwise', noAction, this, 0,0,1,0);
            joint1_ccw = game.add.button(game.world.centerX + 475, 50, 'joint1_ccw', noAction, this, 0,0,1,0);

            joint2_clockwise = game.add.button(game.world.centerX + 565, 150, 'joint2_clockwise', noAction, this, 0,0,1,0);
            joint2_ccw = game.add.button(game.world.centerX + 475, 150, 'joint2_ccw', noAction, this, 0,0,1,0);

            joint3_clockwise = game.add.button(game.world.centerX + 565, 250, 'joint3_clockwise', noAction, this,  0,0,1,0);
            joint3_ccw = game.add.button(game.world.centerX + 475, 250, 'joint3_ccw', noAction, this, 0,0,1,0);

            paintButton = game.add.button(game.world.centerX + 400, game.world.height - 175, 'paint', noAction, this, 0,0,1,0);

            game.add.button(18, 360, 'eraser', actionErase, this, 0,0,1,0);

            game.add.button(30, 30, 'color_red', selectRed, this, 0,0,1,0);
            game.add.button(140,30, 'color_orange', selectOrange, this, 0,0,1,0);
            game.add.button(30,140, 'color_yellow', selectYellow, this, 0,0,1,0);
            game.add.button(140,140, 'color_green', selectGreen, this, 0,0,1,0);
            game.add.button(30,250, 'color_blue', selectBlue, this, 0,0,1,0);
            game.add.button(140,250, 'color_purple', selectPurple, this, 0,0,1,0);

            game.add.button(35, 520, 'size_small', selectSmall, this, 0, 0, 1, 0);
            game.add.button(105, 560, 'size_medium', selectMedium, this, 0, 0, 1, 0);
            game.add.button(35, 600, 'size_large', selectLarge, this, 0, 0, 1, 0);
        }



        //loading links
        // the control panel makes the robot look off center so we have to shift to the left
        // all the sprites need to be the same width to avoid differences in shift values
        // to calculate the y difference, you start with the height, subtract the height of the sprite, then subtract the
        // height to the matching center you are trying to link

        link1 = game.add.sprite(0, 0, 'link1');
        //link1 = game.add.sprite(0, 0, 'link1');
        link2 = game.add.sprite(0, 0, 'link2');
        link3 = game.add.sprite(0, 0, 'link3');


        baseOfChampions = game.add.sprite(game.world.centerX - 108,game.world.height - 75, 'baseOfChampions');

        //setting reference anchor for all links in bottom center point
        link1.anchor.x = 0.2;
        link1.anchor.y = 0.5; //to adjust for where axis appears to be

        link2.anchor.x = 0.2;
        link2.anchor.y = 0.5;

        link3.anchor.x = 0.2;
        link3.anchor.y = 0.5;

        //enable game input
        cursors = game.input.keyboard.createCursorKeys();

        //keyboard shortcuts
        key1 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
        key1.onDown.add(speedSlow,this);

        key2 = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
        key2.onDown.add(speedMedium,this);

        key3 = game.input.keyboard.addKey(Phaser.Keyboard.THREE);
        key3.onDown.add(speedFast,this);

        keySpace = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        keySpace.onDown.add(actionPaint,this);

        keyErase = game.input.keyboard.addKey(Phaser.Keyboard.E);
        keyErase.onDown.add(actionErase,this);

        keyRed = game.input.keyboard.addKey(Phaser.Keyboard.R);
        keyOrange = game.input.keyboard.addKey(Phaser.Keyboard.O);
        keyYellow = game.input.keyboard.addKey(Phaser.Keyboard.Y);
        keyGreen = game.input.keyboard.addKey(Phaser.Keyboard.G);
        keyBlue = game.input.keyboard.addKey(Phaser.Keyboard.B);
        keyPurple = game.input.keyboard.addKey(Phaser.Keyboard.P);

        keySmall =  game.input.keyboard.addKey(Phaser.Keyboard.S);
        keyMedium =  game.input.keyboard.addKey(Phaser.Keyboard.M);
        keyLarge =  game.input.keyboard.addKey(Phaser.Keyboard.L);

        keyRed.onDown.add(selectRed,this);
        keyOrange.onDown.add(selectOrange,this);
        keyYellow.onDown.add(selectYellow,this);
        keyGreen.onDown.add(selectGreen,this);
        keyBlue.onDown.add(selectBlue,this);
        keyPurple.onDown.add(selectPurple,this);

        keySmall.onDown.add(selectSmall, this);
        keyMedium.onDown.add(selectMedium, this);
        keyLarge.onDown.add(selectLarge, this);

        updateSprites();

        //enable graphics for paint brush
        graphics = game.add.graphics(0, 0);

        rotationSpeed = 1;

        //set initial x & y for world mode ctrl
        xPos = endEffectorX
        yPos = endEffectorY
    }

    //needed for compilation, functionality moved to button and updateSprites() function
    function update() {
        //NEED TO BE UPDATED SO WE DON'T LOSE TRACK
        xPos = endEffectorX
        yPos = endEffectorY

        if(!isMaster){
            console.log('checking for update');

            socket.on('update_vars', function(data){

                console.log('updating world variables from master');

                angle1 = data.angle1;
                angle2 = data.angle2;
                angle3 = data.angle3;
				update_sprites();
            });
        }
		else {
			var data = {angle1: angle1, angle2: angle2, angle3: angle3, paint: paintToggle, rotation: rotationSpeed, color: Paintcolor };
            console.log("emitting data to slave");
            socket.emit('world data', data);
        }

    }

    //needed for debugging info
    function render() {}

    //-----------------------------------------------------------------------------
    //Button Functions
    //-----------------------------------------------------------------------------

    function actionJoint1Clockwise () {
        angle1 += rotationSpeed;
        updateSprites();
    }

    function actionJoint1Ccw () {
        angle1 -= rotationSpeed;
        updateSprites();
    }

    function actionJoint2Clockwise () {
        angle2 += rotationSpeed;
        updateSprites();
    }

    function actionJoint2Ccw () {
        angle2 -= rotationSpeed;
        updateSprites();
    }

    function actionJoint3Clockwise () {
        angle3 += rotationSpeed;
        updateSprites();
    }

    function actionJoint3Ccw () {
        angle3 -= rotationSpeed;
        updateSprites();
    }

    function actionPaint(){
        // toggle paint functionality
        paintToggle = !paintToggle;
        // ensure erase function is off
        eraseToggle = false;
    }

    function actionErase(){
        // toggle erase functionality
        eraseToggle = !eraseToggle;
        // ensure paint function is off
        paintToggle = false;
    }


    function selectRed(){
        Paintcolor = 0xFF0000;
    }
    function selectOrange(){
        Paintcolor = 0xFF6A00;
    }
    function selectYellow(){
        Paintcolor = 0xFFD800;
    }
    function selectGreen(){
        Paintcolor = 0x007F0E;
    }
    function selectBlue(){
        Paintcolor = 0x0026FF;
    }
    function selectPurple(){
        Paintcolor = 0x57007F;
    }



    function selectSmall(){
        PaintSize = 5;
    }
    function selectMedium(){
        PaintSize = 10;
    }
    function selectLarge(){
        PaintSize = 20;
    }



    function speedSlow(){
        rotationSpeed = 1;
        incAmt = 3;
    }

    function speedMedium(){
        rotationSpeed = 3;
        incAmt = 8;
    }

    function speedFast(){
        rotationSpeed = 10;
        incAmt = 12;
    }


    function posX_WMCF(){
        var tempX = xPos;
        xPos += incAmt;
        var success = inverseKinSolver(xPos, yPos);
        if(!success)
            xPos = tempX;
    }

    function posY_WMCF(){
        var tempY = yPos;
        yPos -= incAmt;
        var success = inverseKinSolver(xPos, yPos);
        if(!success)
            yPos = tempY;
    }

    function negX_WMCF(){
        var tempX = xPos;
        xPos -= incAmt;
        var success = inverseKinSolver(xPos, yPos);
        if(!success)
            xPos = tempX;
    }

    function negY_WMCF(){
        var tempY = yPos;
        yPos += incAmt;
        var success = inverseKinSolver(xPos, yPos);
        if(!success)
            yPos = tempY;
    }

    function noAction(){
        console.log("angle 1: " + angle1);
        console.log("angle 2: " + angle2);
        console.log("angle 3: " + angle3);
    }