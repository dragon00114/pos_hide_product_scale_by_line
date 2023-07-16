# -*- coding: utf-8 -*-

from odoo import fields, models


class POSConfig(models.Model):

    _inherit = "pos.config"

    allow_avg_scale = fields.Boolean(string='Allow Stable Scale Reading?')
    no_of_reading = fields.Integer(string='Number of Reading', default=5)
    delay_reading = fields.Integer(string='Delay Between reading (Milliseconds)', default=500)
    diff_allow = fields.Float(digits=(16, 3), string='Allowed Difference Scale', default=0.005)
