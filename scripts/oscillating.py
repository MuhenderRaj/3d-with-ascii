from asciithree import Behavior, Shape
from math_3d import Vector3
import math

# Create behavior inheriting from Behavior
class oscillating(Behavior):
    def __init__(self, osc_amount: float):
        self.osc_amount = osc_amount

    def start(self, shape: Shape):
        self.shape_pos = shape.position

    def update(self, timestamp: int, shape: Shape):
        shape.position = self.shape_pos + math.sin(timestamp)*Vector3(1, 1, 1)*self.osc_amount