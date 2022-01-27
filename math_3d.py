from __future__ import annotations
import math

class Quaternion:
    IDENTITY: Quaternion = None
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
        
    def __truediv__(self, other) -> Quaternion:
        if type(other) == Quaternion:
            return self * other.inverse()
        else:
            return self * (1 / other)
    
    def inverse(self):
        return Quaternion(self.real, -self.vec) / (self.real**2 + self.vec.square_magnitude())
    
    @classmethod
    def from_euler(cls, x, y, z):
        """
        Returns quaternion representing rotation by z around z axis, then by x around x axis,
        and finally by y around y axis
        """
        
        q_x = cls.from_axis_angle(Vector3.LEFT, x)
        q_y = cls.from_axis_angle(Vector3.UP, y)
        q_z = cls.from_axis_angle(Vector3.FORWARD, z)
        
        return q_y * q_x * q_z
        

    @classmethod
    def from_axis_angle(cls, axis: Vector3, angle: float):
        """
        Returns a quaternion representing rotation by angle around axis
        """
        real = math.cos(angle / 2)

        vec_mag = math.sqrt(1 - real**2)
        vec = axis.direction() * vec_mag
        
        return cls(real, vec)


class Vector3:
    LEFT: Vector3 = None
    UP: Vector3 = None
    FORWARD: Vector3 = None
    def __init__(self, x: float, y: float, z: float):
        self.x = x
        self.y = y
        self.z = z
    
    def cross_product(self, other: Vector3):
        return Vector3(self.y*other.z - self.z*other.y, self.z*other.x - self.x*other.z, self.x*other.y - self.y*other.x)
    
    def dot_product(self, other: Vector3):
        return self.x*other.x + self.y*other.y + self.z*other.z
    
    def hadamard_product(self, other: Vector3):
        return Vector3(self.x*other.x, self.y*other.y, self.z*other.z)
    
    def square_magnitude(self):
        return self.dot_product(self)

    def magnitude(self):
        return math.sqrt(self.square_magnitude())
    
    def direction(self):
        mag = self.magnitude()
        
        if mag == 0:
            return Vector3(0, 0, 0)
        return self / mag
    
    def rotate_about_axis(self, axis: Vector3, angle: float) -> Vector3:
        q = Quaternion.from_axis_angle(axis, angle)
        
        return (q * self * q.inverse()).vec
    
    def rotate_by_quaternion(self, quaternion: Quaternion) -> Vector3:
        return (quaternion * self * quaternion.inverse()).vec
    
    def as_tuple(self):
        return self.x, self.y, self.z

    def as_int_tuple(self):
        return int(self.x), int(self.y), int(self.z)
    
    def __sub__(self, other: Vector3):
        return self + -other

    def __add__(self, other: Vector3):
        return Vector3(self.x+other.x, self.y+other.y, self.z+other.z)
    
    def __truediv__(self, number: float):
        return Vector3(self.x/number, self.y/number, self.z/number)
    
    def __mul__(self, number: float):
        return Vector3(self.x*number, self.y*number, self.z*number)

    def __rmul__(self, number: float):
        return self * number
    
    def __neg__(self):
        return self * (-1)

Vector3.LEFT = Vector3(1, 0, 0)
Vector3.UP = Vector3(0, 1, 0)
Vector3.FORWARD = Vector3(0, 0, 1)
ZERO_VECTOR = Vector3(0, 0, 0)

UNIT_SCALING = Vector3(1, 1, 1)

Quaternion.IDENTITY = Quaternion(1, ZERO_VECTOR)