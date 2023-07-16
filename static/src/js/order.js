odoo.define('pos_hide_product_scale_by_line.hide_scale_screen', function (require) {
"use strict";

    var Dialog = require('web.Dialog');
    var screens = require('point_of_sale.screens');

    screens.ProductScreenWidget.include({
        click_product: function(product) {
           if(product.to_weight && this.pos.config.iface_electronic_scale){
               // this.gui.show_screen('scale',{product: product});
               this.get_weight(product)
           }else{
               this.pos.get_order().add_product(product);
           }
        },

        get_weight: function(product){
            var self = this;

            if (this.pos.config.allow_avg_scale == true){
                var status = self.pos.proxy.get('status')
                var scale = status.drivers.scale ? status.drivers.scale.status : false;
                if (scale != 'connected')
                {
                    return self.gui.show_popup('alert', {
                        title: _t('Scale Error'),
                        body: _t('1 POR FAVOR VERIFIQUE QUE LA BALANZA ESTE ENCENDIDA Y CONECTADA AL COMPUTADOR!'),
                    });
                }

                var queue = this.pos.proxy_queue;
                var counter = 0;
                var total_reads = [];
                var total_read_value = 0; 
                var final_read = undefined;
                var repeat_status = true;

                queue.schedule(function(){
                    var status = self.pos.proxy.get('status')
                    var scale = status.drivers.scale ? status.drivers.scale.status : false;
                    if (scale != 'connected')
                    {
                        return self.gui.show_popup('alert', {
                            title: _t('Scale Error'),
                            body: _t('2 POR FAVOR VERIFIQUE QUE LA BALANZA ESTE ENCENDIDA Y CONECTADA AL COMPUTADOR!'),
                        });
                    }
                    
                    if (counter == self.pos.config.no_of_reading){
                        repeat_status = false;
                        self.pos.proxy_queue.clear();

                        if(self.pos.config.no_of_reading == 0){
                            // alert("Please configure number of reading for scale")
                            return self.gui.show_popup('alert', {
                                title: _t('Scale Error'),
                                body: _t('Please configure number of reading for scale'),
                            });
                        }
                        var avg_value = total_read_value / self.pos.config.no_of_reading;

                        return self.pos.proxy.scale_read().then(function(weight){
                            if (weight.weight == 0){
                                // alert("Please verify scale is turn on! Weight is 0")
                                self.gui.show_popup('alert', {
                                    title: _t('Scale Error'),
                                    body: _t('1 POR FAVOR VERIFIQUE QUE LA BALANZA ESTE ENCENDIDA, CONECTADA AL COMPUTADOR Y QUE TENGA EL PRODUCTO A PESAR SOBRE LA BANDEJA DE LA MISMA, EL PESO LEIDO ES 0'),
                                });
                            }
                            var avg_weight = weight.weight - avg_value;
                            if (avg_weight <= self.pos.config.diff_allow){
                                if (weight.weight == 0){
                                    // alert("Please verify scale is turn on! Weight is 0")
                                    self.gui.show_popup('alert', {
                                        title: _t('Scale Error'),
                                        body: _t('2 POR FAVOR VERIFIQUE QUE LA BALANZA ESTE ENCENDIDA, CONECTADA AL COMPUTADOR Y QUE TENGA EL PRODUCTO A PESAR SOBRE LA BANDEJA DE LA MISMA, EL PESO LEIDO ES 0'),
                                    });
                                }
                                else{
                                    self.pos.get_order().add_product(product,{ quantity: weight.weight});
                                }
                            }
                            else{
                                // alert("Unstable weight reading")
                                self.gui.show_popup('alert', {
                                    title: _t('Scale Error'),
                                    body: _t('LECTURA DE PESO INESTABLE, POR FAVOR ESPERE A QUE EL PRODUCTO ESTE ESTABLE EN LA BANDEJA DE LA BALANZA ANTES DE SELECCIONARLO EN LA PANTALLA'),
                                });
                            }
                        });

                        counter = 0;
                        total_reads = [];
                        total_read_value = 0; 
                        final_read = undefined;
                    }
                    return self.pos.proxy.scale_read().then(function(weight){
                        total_reads.push(weight.weight);
                        counter = counter + 1;
                        total_read_value = total_read_value + weight.weight;
                    });
                },{duration:this.pos.config.delay_reading, repeat: repeat_status});
            }
            else{
                var status = self.pos.proxy.get('status')
                var scale = status.drivers.scale ? status.drivers.scale.status : false;
                if (scale != 'connected')
                {
                    return self.gui.show_popup('alert', {
                        title: _t('Scale Error'),
                        body: _t('3 POR FAVOR VERIFIQUE QUE LA BALANZA ESTE ENCENDIDA Y CONECTADA AL COMPUTADOR'),
                    });
                }
                return self.pos.proxy.scale_read().then(function(weight){
                    if (weight.weight == 0){
                        // alert("Please verify scale is turn on! Weight is 0")
                        self.gui.show_popup('alert', {
                            title: _t('Scale Error'),
                            body: _t('3 POR FAVOR VERIFIQUE QUE LA BALANZA ESTE ENCENDIDA, CONECTADA AL COMPUTADOR Y QUE TENGA EL PRODUCTO A PESAR SOBRE LA BANDEJA DE LA MISMA, EL PESO LEIDO ES 0'),
                        });
                    }
                    else{
                        self.pos.get_order().add_product(product,{ quantity: weight.weight});
                    }
                });
            }
        },
    });
});
