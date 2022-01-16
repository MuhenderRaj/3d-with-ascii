import math
from os import system
from time import sleep

intensities = ['.', ',', "o", "0", "#", "@"]

class Vector3:
    def __init__(self, x: float, y: float, z: float):
        self.x = x
        self.y = y
        self.z = z
    
    def cross_product(self, other: "Vector3"):
        return Vector3(self.y*other.z - self.z*other.y, self.z*other.x - self.x*other.z, self.x*other.y - self.y*other.x)
    
    def dot_product(self, other: "Vector3"):
        return self.x*other.x + self.y*other.y + self.z*other.z
    
    def square_magnitude(self):
        return self.dot_product(self)

    def magnitude(self):
        return math.sqrt(self.square_magnitude())
    
    def direction(self):
        mag = self.magnitude()
        
        if mag == 0:
            return Vector3(0, 0, 0)
        return self / mag
    
    def rotate(self, axis: "Vector3", angle: float):
        real = math.cos(angle / 2)
        vec_mag = math.sqrt(1 - real**2)
        
        vec = axis.direction() * vec_mag
        
        q = Quaternion(real, vec)
        
        return (q * self * q.inverse()).vec
    
    def as_tuple(self):
        return self.x, self.y, self.z

    def as_int_tuple(self):
        return int(self.x), int(self.y), int(self.z)
    
    def __sub__(self, other: "Vector3"):
        return self + -other

    def __add__(self, other: "Vector3"):
        return Vector3(self.x+other.x, self.y+other.y, self.z+other.z)
    
    def __truediv__(self, number: float):
        return Vector3(self.x/number, self.y/number, self.z/number)
    
    def __mul__(self, number: float):
        return Vector3(self.x*number, self.y*number, self.z*number)

    def __rmul__(self, number: float):
        return self * number
    
    def __neg__(self):
        return self * (-1)
    
class Quaternion:
    def __init__(self, real: float, vec: Vector3):
        self.real = real
        self.vec = vec
    
    def __add__(self, other):
        if type(other) == Quaternion:
            return Quaternion(self.real+other.real, self.vec+other.vec)
        elif type(other) == Vector3:
            return Quaternion(self.real, self.vec+other)
        elif type(other) in [int, float]:
            return Quaternion(self.real+other, self.vec)
        else:
            raise Exception("Huh?")
    
    def __radd__(self, other):
        return self + other

    def __neg__(self):
        return Quaternion(-self.real, -self.vec)

    def __sub__(self, other):
        return self + -other

    def __rsub__(self, other):
        return -self + other
    
    def __mul__(self, other):
        if type(other) == Quaternion:
            return Quaternion(
                self.real*other.real - self.vec.dot_product(other.vec), 
                self.real*other.vec + other.real*self.vec + self.vec.cross_product(other.vec)
            )
        elif type(other) == Vector3:
            return Quaternion(
                -self.vec.dot_product(other),
                self.real*other + self.vec.cross_product(other)
            )
        elif type(other) in [int, float]:
            return Quaternion(self.real*other, self.vec*other)
        
    def __rmul__(self, other):
        if type(other) == Quaternion:
            return other * self
        else:
            return self * other
        
    def __truediv__(self, other) -> "Quaternion":
        if type(other) == Quaternion:
            return self * other.inverse()
        else:
            return self * (1 / other)
    
    def inverse(self):
        return Quaternion(self.real, -self.vec) / (self.real**2 + self.vec.square_magnitude())


    
    
    
class Object_3D:
    def __init__(self, position: Vector3, rotation: Quaternion=None, scaling: Vector3=None):
        self.position = position
        self.rotation = rotation
        self.scaling = scaling


class Shape(Object_3D):
    def __init__(self, vertices: list[tuple[int, int, int]], triangles: list[tuple[int, int, int]], position: Vector3, rotation: Quaternion=None, scaling: Vector3=None):
        """
        Creates a new shape. 

        Arguments:
        vertices: a list of the coordinates of the vertices in R^3
        triangles: a list of triangulated faces. The normals are given by the right hand rule
        """
        super().__init__(position, rotation, scaling)

        self.vertices = vertices
        self.triangles = triangles
        
        self.calculate_normals()
    
    def calculate_normals(self):
        self.normals: list[Vector3] = []
        
        for triangle in self.triangles:
            a_vec, b_vec, c_vec = [Vector3(*self.vertices[i]) for i in triangle]
            
            normal = (b_vec - a_vec).cross_product(c_vec - a_vec).direction()
            
            self.normals.append(normal)
        
            
    def rotate(self):
        new_vertices = []
        for vertex in self.vertices:
            new_vertex = Vector3(*vertex).rotate(Vector3(0, 1, 0), 0.4).as_tuple()
            new_vertices.append(new_vertex)
        
        self.vertices = new_vertices
        self.calculate_normals()
            
class Camera(Object_3D):
    def __init__(self, width: int, height: int, environment: "Environment", zoom: float, position: Vector3, rotation: Quaternion=None, scaling: Vector3=None):
        super().__init__(position, rotation, scaling)
        self.width = width
        self.height = height
        self.environment = environment
        self.zoom = zoom
        self.clear_screen()

    def _is_in_bounds(self, point: tuple[int, int]):
        x, y = point
        return 0 <= x < self.width and 0 <= y < self.height

    def _render_triangle(self, intensity: float, triangle: tuple[tuple[int, int], tuple[int, int], tuple[int, int]]):
        rect_min_x = min([vertex[0] for vertex in triangle])
        rect_max_x = max([vertex[0] for vertex in triangle])
        rect_min_y = min([vertex[1] for vertex in triangle])
        rect_max_y = max([vertex[1] for vertex in triangle])
            
        a, b, c = triangle

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
                    self.screen[y][x] = intensity

    def clear_screen(self):
        self.screen = [[" " for _ in range(self.width)] for _ in range(self.height)]

    def world_to_screen_space(self, point: tuple[int, int, int], viewing_normal: Vector3):
        p_vec = Vector3(*point)
        a_vec = self.position
        b_vec = viewing_normal
        
        # Screen space unit vectors
        x_vec = b_vec.cross_product(Vector3(0, 1, 0)).direction()
        y_vec = x_vec.cross_product(b_vec).direction()
        
        p_minus_a = p_vec - a_vec
        
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
    
    def render(self, perspective=False):
        self.clear_screen()

        # TODO logic to calculate viewing normal
        viewing_normal = (-1, -0.8, -1.2)
        vec_normal = Vector3(*viewing_normal)
        
        # Render each shape
        for shape in self.environment.shapes:
            # For each triangle and its normal in the shape
            for triangle, normal in zip(shape.triangles, shape.normals):
                cos_normal_viewing = -normal.dot_product(vec_normal) / vec_normal.magnitude()
                
                # If face is facing away
                if cos_normal_viewing <= 0:
                    continue

                # Get actual triangle instead of the conventional representation
                actual_triangle = _triangle_index_to_triangle(triangle, shape.vertices)
                
                if perspective:
                    break
                    # TODO: add logic for perspective later
                else: # Orthographic projection
                    screen_triangle = tuple(self.world_to_screen_space((Vector3(*vertex)+self.position).as_tuple(), vec_normal) for vertex in actual_triangle)

                # Print the triangle to the console
                self._render_triangle(intensities[int(cos_normal_viewing * 10)%6], screen_triangle)                 
                
        return self.screen
        


def _triangle_index_to_triangle(triangle: tuple[int, int, int], vertices: list[tuple[int, int, int]]):
    return [vertices[i] for i in triangle]


 

class Environment:
    def __init__(self, shapes: list[Shape]):
        self.shapes = shapes
        self.mainCamera = Camera(70, 100, self, 3, Vector3(15., 5., 15.))
        
    def render(self):
        return self.mainCamera.render()

    
                
                
                

if __name__ == "__main__":
    s = Shape(
        vertices=[(-5, -5, -5), (-5, -5, 5), (-5, 5, -5), (-5, 5, 5), (5, -5, -5), (5, -5, 5), (5, 5, -5), (5, 5, 5)],
        triangles=[(0, 1, 3), (0, 3, 2), (0, 4, 5), (0, 5, 1), (0, 2, 6), (0, 6, 4), (1, 5, 7), (1, 7, 3), (3, 7, 6), (3, 6, 2), (4, 6, 7), (4, 7, 5)],
        position=Vector3(5., 5., 5.),
    )
    
    
    e = Environment([s])

    time = 0 
    while True:
        output = e.render()
        time += 1
        s.rotate()
        
        # for row in output:
        #     new_row = [element for tup in zip(row, row) for element in tup]
        #     new_row.append(".")
            
        #     print("".join(new_row))
            
        with open("output.txt", 'w') as file:
            output_str = ""
            for row in output:
                new_row = "".join([element for tup in zip(row, row) for element in tup])
                output_str += new_row
                output_str += "\n"

            file.write(output_str)
            
        sleep(2)
        _ = system("cls")
        