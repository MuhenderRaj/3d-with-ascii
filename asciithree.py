#!/usr/bin/env python3
from __future__ import annotations

import math
import os
from time import sleep
from abc import abstractmethod

from math_3d import *
from config import *

intensities = ['.', ',', ";", "0", "#", "@"]

class Behavior:
    def start(self, shape: Shape):
        pass
    
    def update(self, timestamp: int, shape: Shape):
        pass

class Object_3D:
    def __init__(self, position: Vector3, rotation: Quaternion, scaling: Vector3):
        self.position = position
        self.rotation = rotation
        self.scaling = scaling
        self.behaviors: list[Behavior] = []
        
    def update(self, timestamp: int):
        # self.rotation = Quaternion.from_axis_angle(Vector3.UP, 0.1) * self.rotation
        for behavior in self.behaviors:
            behavior.update(timestamp, self)
    
    def add_behavior(self, behavior: Behavior):
        self.behaviors.append(behavior)
        behavior.start(self)
    

        
class Light(Object_3D):
    pass


class Shape(Object_3D):
    def __init__(self, vertices: list[tuple[int, int, int]], triangles: list[tuple[int, int, int]], position: Vector3, rotation: Quaternion, scaling: Vector3):
        """
        Creates a new shape. 

        Arguments:
        vertices: a list of the coordinates of the vertices in R^3
        triangles: a list of triangulated faces. The normals are given by the right hand rule
        """
        super().__init__(position, rotation, scaling)

        self.vertices = vertices
        self.triangles = triangles
        self.hidden = False
        
        self.calculate_normals()
    
    def calculate_normals(self):
        self.normals: list[Vector3] = []
        
        for triangle in self.triangles:
            a_vec, b_vec, c_vec = [self.location_of_vertex(self.vertices[i]) for i in triangle]
            
            normal = (b_vec - a_vec).cross_product(c_vec - a_vec).direction()
            
            self.normals.append(normal)
            
    def location_of_vertex(self, vertex):
        return self.position + Vector3(*vertex).hadamard_product(self.scaling).rotate_by_quaternion(self.rotation)
    
    def update(self, timestamp: int):
        super().update(timestamp)
        self.calculate_normals()
        
            
        
    @classmethod
    def from_obj(cls, filename: str, position: Vector3, rotation: Quaternion, scaling: Vector3):
        vertices = []
        triangles = []
        
        with open(filename, 'r') as file:
            lines = file.readlines()
            
            for line in lines:
                line = line.strip()
                tokens = line.split(" ")
                
                tokens = [token for token in tokens if token != '']

                if len(tokens) == 0:
                    continue

                if tokens[0] == '#':
                    continue
                elif tokens[0] == 'v':
                    vertices.append((float(tokens[1]), float(tokens[2]), float(tokens[3])))
                elif tokens[0] == 'f':
                    verts = [int(tok.split("/")[0]) for tok in tokens[1:]]
                    if len(verts) == 3:
                        first, second, third = verts
                        triangles.append((first - 1, second - 1, third - 1))
                    elif len(verts) == 4:
                        first, second, third, fourth = verts
                        triangles.append((first - 1, second - 1, third - 1))
                        triangles.append((third - 1, fourth - 1, first - 1))
                    else:
                        raise ValueError("Faces must be triangles or quads")
                        
        
        return cls(vertices, triangles, position, rotation, scaling)
        
class Cube(Shape):
    def __init__(self, position: Vector3, rotation: Quaternion, scaling: Vector3):
        vertices = [(-1, -1, -1), (-1, -1, 1), (-1, 1, -1), (-1, 1, 1), (1, -1, -1), (1, -1, 1), (1, 1, -1), (1, 1, 1)]
        triangles = [(0, 1, 3), (0, 3, 2), (0, 4, 5), (0, 5, 1), (0, 2, 6), (0, 6, 4), (1, 5, 7), (1, 7, 3), (3, 7, 6), (3, 6, 2), (4, 6, 7), (4, 7, 5)]
        super().__init__(vertices, triangles, position, rotation, scaling)
        
class Tetrahedron(Shape):
    def __init__(self, position: Vector3, rotation: Quaternion, scaling: Vector3):
        vertices = [(0, 1, 0), (1, -1/3, 0), (-1/2, -1/3, -math.sqrt(3)/2), (-1/2, -1/3, math.sqrt(3)/2)]
        triangles = [(0, 1, 2), (0, 2, 3), (0, 3, 1), (1, 3, 2)]
        super().__init__(vertices, triangles, position, rotation, scaling)
    

        
            
class Camera(Object_3D):
    def __init__(self, width: int, height: int, environment: "Environment", zoom: float, perspective: bool, depth: float, position: Vector3, rotation: Quaternion, scaling: Vector3):
        super().__init__(position, rotation, scaling)
        self.width = width
        self.height = height
        self.environment = environment
        self.zoom = zoom
        self.perspective = perspective
        self.depth = depth
        self.clear_screen()

    def _is_in_bounds(self, point: tuple[int, int]):
        x, y = point
        return 0 <= x < self.width and 0 <= y < self.height

    def _render_triangle(self, intensity: float, triangle_3d: tuple[Vector3, Vector3, Vector3], viewing_normal: Vector3, triangle_normal: Vector3):
        triangle = [self.world_to_screen_space(point.as_tuple(), viewing_normal, self.perspective, self.depth) for point in triangle_3d]

        rect_min_x = min([vertex[0] for vertex in triangle])
        rect_max_x = max([vertex[0] for vertex in triangle])
        rect_min_y = min([vertex[1] for vertex in triangle])
        rect_max_y = max([vertex[1] for vertex in triangle])
            
        a, b, c = triangle
        a_cam_vec = self.position
        n_vec = triangle_normal
        
        depth_normal = self.depth*viewing_normal.direction()

        for y in range(rect_min_y, rect_max_y + 1):
            for x in range(rect_min_x, rect_max_x + 1):
                if not self._is_in_bounds((x, y)):
                    continue

                x_a = (x-a[0], y-a[1])
                x_b = (x-b[0], y-b[1])
                x_c = (x-c[0], y-c[1])
                
                a_b = x_a[0]*x_b[1]-x_b[0]*x_a[1]
                b_c = x_b[0]*x_c[1]-x_c[0]*x_b[1]
                c_a = x_c[0]*x_a[1]-x_a[0]*x_c[1]
                
                if a_b <= 0 and b_c <= 0 and c_a <= 0 or a_b >= 0 and b_c >= 0 and c_a >= 0:

                    u = x - self.width // 2
                    v = self.height // 2 - y
                    
                    p_prime_vec = u*self.x_vec + v*self.y_vec + depth_normal
                    a_triangle_vec = triangle_3d[0]
                    
                    dist = (a_triangle_vec - a_cam_vec).dot_product(n_vec) * (p_prime_vec.magnitude() / p_prime_vec.dot_product(n_vec))
                    
                    if dist < self.z_buffer[y][x]:
                        self.screen[y][x] = intensity
                        self.z_buffer[y][x] = dist

    def clear_screen(self):
        self.screen = [[" " for _ in range(self.width)] for _ in range(self.height)]
        self.z_buffer = [[float("inf") for _ in range(self.width)] for _ in range(self.height)]

    def world_to_screen_space(self, point: tuple[int, int, int], viewing_normal: Vector3, perspective=False, depth=None):
        p_vec = Vector3(*point)
        a_vec = self.position
        b_vec = viewing_normal
        
        # Screen space unit vectors
        x_vec = b_vec.cross_product(Vector3(0, 1, 0)).direction()
        y_vec = x_vec.cross_product(b_vec).direction()
        
        self.x_vec = x_vec
        self.y_vec = y_vec
        
        p_minus_a = p_vec - a_vec
        
        if perspective:
            b_mag = b_vec.magnitude()
            d_vec = -depth * b_vec / b_mag + (b_mag * depth / p_minus_a.dot_product(b_vec)) * p_minus_a
        else:
            d_vec = p_minus_a - (p_minus_a.dot_product(b_vec) / b_vec.square_magnitude()) * b_vec
        
        x_cross_y = x_vec.cross_product(y_vec)

        if abs(x_cross_y.x) >= 1e-4:
            u = d_vec.cross_product(y_vec).x / x_cross_y.x
            v = x_vec.cross_product(d_vec).x / x_cross_y.x
        elif abs(x_cross_y.y) >= 1e-4:
            u = d_vec.cross_product(y_vec).y / x_cross_y.y
            v = x_vec.cross_product(d_vec).y / x_cross_y.y
        else:
            u = d_vec.cross_product(y_vec).z / x_cross_y.z
            v = x_vec.cross_product(d_vec).z / x_cross_y.z
        
        return (self.width // 2 + int(self.zoom*u), self.height // 2 - int(self.zoom*v))
    
    def render(self):
        self.clear_screen()

        # TODO logic to calculate viewing normal
        vec_normal = Vector3.FORWARD.rotate_by_quaternion(self.rotation)
        
        # Render each shape
        for shape in self.environment.shapes:
            if shape.hidden:
                continue

            # For each triangle and its normal in the shape
            for triangle, normal in zip(shape.triangles, shape.normals):
                cos_normal_viewing = -normal.dot_product(vec_normal) / vec_normal.magnitude()
                
                
                if self.perspective:
                    point = Vector3(*shape.vertices[triangle[0]]) \
                                .hadamard_product(shape.scaling) \
                                .rotate_by_quaternion(shape.rotation) \
                                + shape.position
                    if (point - self.position).dot_product(normal) >= 0:
                        continue
                else:
                    # If face is facing away
                    if cos_normal_viewing <= 0:
                        continue

                # Get actual triangle instead of the conventional representation
                actual_triangle = _triangle_index_to_triangle(triangle, shape.vertices)
                
                transformed_triangle = tuple(
                    (
                        Vector3(*vertex)
                            .hadamard_product(shape.scaling)
                            .rotate_by_quaternion(shape.rotation)
                        + shape.position
                    )
                    for vertex in actual_triangle
                )

                self._render_triangle(intensities[int(cos_normal_viewing * 5.9)], transformed_triangle, vec_normal, normal)                 
                
        return self.screen
        


def _triangle_index_to_triangle(triangle: tuple[int, int, int], vertices: list[tuple[int, int, int]]):
    return [vertices[i] for i in triangle]


 

class Environment:
    def __init__(self, shapes: list[Shape]=None, lights: list[Light]=None):
        self.shapes = shapes if shapes is not None else []
        # self.main_camera = Camera(
        #     width=70,
        #     height=50, 
        #     environment=self, 
        #     zoom=1,
        #     perspective=True,
        #     depth=100,
        #     position=Vector3(0, 25, 30),
        #     rotation=Quaternion.from_euler(math.pi / 6, math.pi, 0),
        #     scaling=UNIT_SCALING
        # )
        self.main_camera: Camera = None
        self.lights = lights if lights is not None else []
        
    def update(self, timestamp):
        for shape in self.shapes:
            shape.update(timestamp)
        self.main_camera.update(timestamp)
        
    def render(self):
        return self.main_camera.render()
    
    def create_shape_from_file(self, filepath: type[Shape], position: Vector3, rotation: Quaternion, scaling: Vector3):
        new_shape = Shape.from_obj(filepath, position, rotation, scaling)
        self.shapes.append(new_shape)
        return new_shape

    def create_custom_shape(self, shape: type[Shape], position: Vector3, rotation: Quaternion, scaling: Vector3):
        return self.create_shape_from_file(os.path.join(CUSTOM_SHAPES_DIR, f"{shape}.obj"), position, rotation, scaling)

    def create_preset_shape(self, shape: type[Shape], position: Vector3, rotation: Quaternion, scaling: Vector3):
        return self.create_shape_from_file(f"presets/{shape}.obj", position, rotation, scaling)

    def create_cube(self, position: Vector3, rotation: Quaternion, scaling: Vector3):
        new_shape = Cube(position, rotation, scaling)
        self.shapes.append(new_shape)
        return new_shape

    def create_tetrahedron(self, position: Vector3, rotation: Quaternion, scaling: Vector3):
        new_shape = Tetrahedron(position, rotation, scaling)
        self.shapes.append(new_shape)
        return new_shape


def main_loop(env: Environment, output_file: str="output.txt", sleep_time: float=0.1):
    timestamp = 0
    while True:
        env.update(timestamp)
        output = env.render()
        timestamp += 1

        with open(output_file, 'w') as file:
            output_str = ""
            for row in output:
                new_row = "".join([element for tup in zip(row, row) for element in tup])
                output_str += new_row
                output_str += "\n"

            file.write(output_str)
        
        sleep(0.1)
    
if __name__ == "__main__":
    e = Environment()

    s = e.create_cube(
        position=Vector3(0, 0, 0),
        rotation=Quaternion.IDENTITY,
        scaling=UNIT_SCALING * 5
    )

    s_2 = e.create_cube(
        position=Vector3(5, -5, -5),
        rotation=Quaternion.IDENTITY,
        scaling=Vector3(1, 0.5, 1) * 5
    )
    
    s_3 = e.create_tetrahedron(
        position=Vector3(5, 5, 5),
        rotation=Quaternion.IDENTITY,
        scaling=UNIT_SCALING * 5
    )
    
    s_4 = e.create_preset_shape(
        shape="teapot", 
        position=Vector3(0, 0, 0),
        rotation=Quaternion.IDENTITY,
        scaling=UNIT_SCALING * 3
    )
    
    
    s_5 = e.create_preset_shape(
        shape="among us", 
        position=Vector3(0, 0, 0),
        rotation=Quaternion.IDENTITY,
        scaling=UNIT_SCALING / 15 
    )
    
    # s.hidden = True
    s_2.hidden = True
    s_3.hidden = True
    s_4.hidden = True
    
    # e = Environment([s, s_2, s_3, s_4, s_5], [])
    
    # e = Environment()

    time = 0 
    while True:
        output = e.render()
        time += 1
        # s.rotate()
        e.update(time)

        with open("output.txt", 'w') as file:
            output_str = ""
            for row in output:
                new_row = "".join([element for tup in zip(row, row) for element in tup])
                output_str += new_row
                output_str += "\n"

            file.write(output_str)
            
        sleep(0.1)
        