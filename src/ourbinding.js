/*!
 * OurBinding v0.1.0
 *
 * Simple Data Binding
 *
 * beyond.li
 * v0.1.0 2016-10-19 first version
 */
var ourBinding = function () {
  "use strict";
  return {
    formatters: {
      itemList: function (elem, params) {
        var dataList = params[0];
        var templateClass = params[1];
        var oldOne = $('.' + templateClass, elem);
        $.each(dataList, function (idx, item) {
          var type = typeof item;
          if (type === 'string' || type === 'number' || type === 'boolean') {
            item = { _value: item };
          }
          item._counter = idx + 1;
          item._counter0 = idx;
          var newOne = oldOne.clone().removeClass(templateClass);
          ourBinding.bindData(item, newOne);
          oldOne.before(newOne.show());
        });
        oldOne.hide();
      },
      formatDate: function (elem, params) {
        if (params[0].search(/Z|(\+|-)\d\d:\d\d$/) < 0) {
          params[0] += ourBinding.tzSuffix;
        }
        var date = new Date(params[0]);
        var now = new Date();
        var format = '~%Y-%m-%d %H:%M';
        if (params.length >= 2) {
          format = params[1].replace('%f', '%S:%f').replace('%S', '%M:%S').replace('%M', '%H:%M');
        }
        var zfill = function (s, n) {
          return (Array(Math.abs(n) + 1).join('0') + s).slice(-n);
        };
        if (format[0] == '~') {
          format = format.slice(1);
          var elapse = Date.now() - date;
          if (elapse < 60000) {
            return '刚刚';
          } else if (elapse < 300000) {
            return (elapse / 60000).toFixed() + '分钟前';
          } else if (date.toDateString() == now.toDateString()) {
            return '今天 ' + zfill(date.getHours(), 2) + ':' + zfill(date.getMinutes(), 2);
          }
        }
        var dateStr = format.replace('%Y', date.getFullYear())
                            .replace('%m', zfill(date.getMonth() + 1, 2))
                            .replace('%d', zfill(date.getDate(), 2))
                            .replace('%H', zfill(date.getHours(), 2))
                            .replace('%M', zfill(date.getMinutes(), 2))
                            .replace('%S', zfill(date.getSeconds(), 2))
                            .replace('%f', zfill(date.getMilliseconds(), 6));
        return dateStr;
      },
      asFileSize: function (elem, params) {
        var num_bytes = params[0];
        if (num_bytes == null) {
          return '';
        }
        var units = ['TB', 'GB', 'MB', 'KB', 'Bytes'];
        var unit = units.pop();
        var num = parseFloat(num_bytes);
        while (num > 999 && units) {
          num = num / 1024;
          unit = units.pop();
        }
        if (unit == 'Bytes') {
          return num + ' Bytes';
        }
        return num.toFixed(2) + ' ' + unit;
      },
      yesNo: function (elem, params) { return params[0] ? params[1] : params[2]; },
      joinStr: function (elem, params) { return params[0].join(params[1]); },
      templateStr: function (elem, params) { return params[1].replace('$', params[0]); },
      addClass: function (elem, params) { elem.addClass(params[1], params[0]); return params[0]; },
      setAttr: function (elem, params) { elem.attr(params[1], params[0]); return params[0]; },
      setChecked: function (elem, params) { elem.prop('checked', params[0] == elem.val()); return params[0]; },
      setHtml: function (elem, params) { elem.html(params[0]); return params[0]; },
      setStyle: function (elem, params) { elem.css(params[1], params[0]); return params[0]; },
      setText: function (elem, params) { elem.text(params[0]); return params[0]; },
      callMethod: function (elem, params) { return params[0][params[1]](); },
      getProperty: function (elem, params) { return params[0][params[1]]; }
    },
    tzSuffix: function () {
      var tz = new Date().getTimezoneOffset();
      return (tz <= 0 ? '+' : '-') + ('00' + (Math.abs(tz) / 60 - 0.5).toFixed()).slice(-2) + ':' + ('00' + tz % 60).slice(-2);
    }(),
    bindData: function (data, control) {
      var controls = $(control).find('*').addBack();
      for (var key in data) {
        controls.filter('[name="' + key + '"]').each(function (idx, elem) {
          var elem = $(elem);
          var value = data[key];
          var formatters = (elem.attr('formatter') || 'setText').split('|');
          $.each(formatters, function (idx, item) {
            var params = item.split(':');
            var formatter = ourBinding.formatters[params[0]];
            if (formatter) {
              params[0] = value;
              value = formatter(elem, params);
            }
          });
        });
      }
    },
    loadData: function (control) {
      var data = {};
      $(control).find('[name]').each(function () {
        if ((this.type == 'radio' || this.type == 'checkbox' || this.tagName == 'OPTION') && this.checked == false) {
          return;
        }
        data[$(this).attr('name')] = $(this).val();
      });
      return data;
    }
  };
}();
