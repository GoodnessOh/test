
let bodyPose;
let video;
let poses = [];

let sound1;
let sound2;
let currentZone = -1;

let connections = [
  [5, 7], [7, 9], [6, 8], [8, 10],
  [5, 6], [5, 11], [6, 12], [11, 12],
  [11, 13], [13, 15], [12, 14], [14, 16]
];

function preload() {
  bodyPose = ml5.bodyPose();

  sound1 = loadSound("ghost1.m4a");
  sound2 = loadSound("ghost2.mp3");
}2

function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  bodyPose.detectStart(video, gotPoses);
}

function draw() {
  // Spegelvänd kameran
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // Dela skärmen i fyra rutor
  stroke(255);
  strokeWeight(2);
  line(320, 0, 320, 480);
  line(0, 240, 640, 240);

  // Rita skelettet
  for (let pose of poses) {
    for (let connection of connections) {
      let a = pose.keypoints[connection[0]];
      let b = pose.keypoints[connection[1]];

      if (a.confidence > 0.1 && b.confidence > 0.1) {
        stroke(255, 0, 0);
        strokeWeight(2);
        line(width - a.x, a.y, width - b.x, b.y);
      }
    }

    for (let keypoint of pose.keypoints) {
      if (keypoint.confidence > 0.1) {
        fill(0, 255, 0);
        noStroke();
        circle(width - keypoint.x, keypoint.y, 10);
      }
    }
  }

  // Kontrollera ansiktets position
  let newZone = -1;

  if (poses.length > 0) {
    let nose = poses[0].keypoints[0];

    if (nose && nose.confidence > 0.5) {
      let x = width - nose.x;
      let y = nose.y;

      if (x < 320 && y < 240) {
        newZone = 0; // Övre vänster
      } else if (x >= 320 && y < 240) {
        newZone = 1; // Övre höger
      }
    }
  }


  // Spela ljud när personen går in i en ny ruta
  if (newZone !== currentZone) {

    if (getAudioContext().state === "running") {

      if (newZone === 0) {
        sound1.play();
      }

      if (newZone === 1) {
        sound2.play();
      }
    }

    currentZone = newZone;
  }
}


function gotPoses(results) {
  poses = results;
}

function mousePressed() {
  userStartAudio();
}
