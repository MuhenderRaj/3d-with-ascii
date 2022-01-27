#!/usr/bin/env python3
from main import *

env = Environment()


class s1_cube(Cube):
    def update(self, timestamp):
        # if self.position.x >= 0:
        #     self.position += 0.5*Vector3(1, 1, 1) if self.position.x <= 1.1 else -0.5*Vector3(1, 1, 1)
        # else:
        #     self.position -= 0.5*Vector3(1, 1, 1) if self.position.x >= -1.1 else -0.5*Vector3(1, 1, 1)
        
        self.position = math.sin(timestamp)*Vector3(1, 1, 1)*2
        
        # self.calculate_normals()
        super().update(timestamp)

s1 = s1_cube(Vector3(0, 0, 0), Quaternion.IDENTITY, UNIT_SCALING * 5)

env.shapes.append(s1)

timestamp = 0
while True:
    env.update(timestamp)
    output = env.render()
    timestamp += 1

    with open("output.txt", 'w') as file:
        output_str = ""
        for row in output:
            new_row = "".join([element for tup in zip(row, row) for element in tup])
            output_str += new_row
            output_str += "\n"

        file.write(output_str)
    
    sleep(0.1)
    
