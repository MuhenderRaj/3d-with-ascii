import math

intensities = ['.', ',', "o", "0", "#", "@"]

class Vector3:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z
    
    def cross_product(self, other):
        return Vector3(self.y*other.z - self.z*other.y, self.z*other.x - self.x*other.z, self.x*other.y - self.y*other.x)
    
    def dot_product(self, other):
        return self.x*other.x + self.y*other.y + self.z*other.z
    
    def magnitude(self):
        return math.sqrt(self.x**2 + self.y**2 + self.z**2)
    
    def direction(self):
        mag = self.magnitude()
        return Vector3(self.x / mag, self.y / mag, self.z / mag)
    
    def as_tuple(self):
        return self.x, self.y, self.z
    
    def __sub__(self, other):
        return Vector3(self.x-other.x, self.y-other.y, self.z-other.z)

    def __add__(self, other):
        return Vector3(self.x+other.x, self.y+other.y, self.z+other.z)
    
    

class Shape:
    def __init__(self, vertices, triangles, position, rotation=None, scaling=None):
        """
        Creates a new shape. 

        Arguments:
        vertices: a list of the coordinates of the vertices in R^3
        triangles: a list of triangulated faces. The normals are given by the right hand rule
        """
        self.vertices = vertices
        self.triangles = triangles
        self.position = position
        
        self.normals = []
        
        for triangle in self.triangles:
            a_vec, b_vec, c_vec = [Vector3(*self.vertices[i]) for i in triangle]
            
            normal = (b_vec - a_vec).cross_product(c_vec - a_vec).direction()
            
            self.normals.append(normal)
            
    def render(viewing_normal):
        
        
    

if __name__ == "__main__":
    s = Shape(
        [(0, 0, 0), (0, 0, 1), (0, 1, 0), (0, 1, 1), (1, 0, 0), (1, 0, 1), (1, 1, 0), (1, 1, 1)],
        [(0, 1, 3), (0, 3, 2), (0, 4, 5), (0, 5, 1), (0, 2, 6), (0, 6, 4), (1, 5, 7), (1, 7, 3), (3, 7, 6), (3, 6, 2), (4, 6, 7), (4, 7, 5)]
    )
    
    viewing_normal = Vector3(1, 1, 1)
    
    
