#!/usr/bin/env python3
# Required import
from asciithree import *

# Import required scripts
from scripts.oscillating import oscillating
# Import further scripts here

# Create environment
env = Environment()

# Create main camera
main_camera = Camera(
    width=70,
    height=50, 
    environment=env, 
    zoom=1,
    perspective=True,
    depth=100,
    position=Vector3(0, 25, 30),
    rotation=Quaternion.from_euler(math.pi / 6, math.pi, 0),
    scaling=UNIT_SCALING
)

# Create object with behavior
s1 = Cube(Vector3(0, 0, 0), Quaternion.IDENTITY, UNIT_SCALING * 3)
# Create further objects here

# Add behaviors to objects
# s1.add_behavior(oscillating(2)) # optionally add parameters during initialization similar to Unity's system
main_camera.add_behavior(oscillating(3))
# Add more behaviors here

# Add objects to environment
env.shapes.append(s1)
# Add further objects here

env.main_camera = main_camera

# Main loop. Use only one main loop call per program
main_loop(env, "output.txt", 0.1)