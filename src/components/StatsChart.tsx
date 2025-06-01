/**
 * 统计图表组件
 * 使用Highcharts技术实现数据可视化
 * 展示秒杀系统的实时统计数据
 */

import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import type { SeckillStats } from '../shared/types';

interface StatsChartProps {
  stats: SeckillStats;
  title?: string;
}

export function StatsChart({ stats, title = '秒杀数据统计' }: StatsChartProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  // 配置Highcharts主题
  useEffect(() => {
    Highcharts.setOptions({
      colors: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
      ],
      chart: {
        backgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
          stops: [
            [0, '#ffffff'],
            [1, '#f8fafc']
          ]
        },
        style: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }
      },
      title: {
        style: {
          color: '#2d3748',
          fontSize: '20px',
          fontWeight: 'bold'
        }
      }
    });
  }, []);

  // 24小时订单趋势图配置
  const hourlyOrdersOptions: Highcharts.Options = {
    chart: {
      type: 'areaspline',
      height: 300,
    },
    title: {
      text: '24小时订单趋势'
    },
    subtitle: {
      text: '实时更新的订单数量变化'
    },
    xAxis: {
      categories: stats.hourlyStats.map(item => item.hour),
      title: {
        text: '时间'
      }
    },
    yAxis: [
      {
        title: {
          text: '订单数量',
          style: { color: '#FF6B6B' }
        },
        labels: {
          style: { color: '#FF6B6B' }
        }
      },
      {
        title: {
          text: '收入金额 (元)',
          style: { color: '#4ECDC4' }
        },
        labels: {
          style: { color: '#4ECDC4' }
        },
        opposite: true
      }
    ],
    plotOptions: {
      areaspline: {
        fillOpacity: 0.3,
        marker: {
          enabled: true,
          radius: 4
        }
      }
    },
    series: [
      {
        name: '订单数量',
        type: 'areaspline',
        data: stats.hourlyStats.map(item => item.orders),
        color: '#FF6B6B',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(255, 107, 107, 0.3)'],
            [1, 'rgba(255, 107, 107, 0.1)']
          ]
        }
      },
      {
        name: '收入金额',
        type: 'areaspline',
        yAxis: 1,
        data: stats.hourlyStats.map(item => item.revenue),
        color: '#4ECDC4',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(78, 205, 196, 0.3)'],
            [1, 'rgba(78, 205, 196, 0.1)']
          ]
        }
      }
    ],
    tooltip: {
      shared: true,
      valueSuffix: '',
      formatter: function() {
        let tooltip = `<b>${this.x}</b><br/>`;
        this.points?.forEach(point => {
          const suffix = point.series.name === '收入金额' ? ' 元' : ' 个';
          tooltip += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y}${suffix}</b><br/>`;
        });
        return tooltip;
      }
    },
    legend: {
      align: 'center',
      layout: 'horizontal'
    },
    credits: {
      enabled: false
    }
  };

  // 商品状态饼图配置
  const productStatusOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      height: 300,
    },
    title: {
      text: '商品状态分布'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%'
        },
        showInLegend: true,
        innerSize: '40%'
      }
    },
    series: [{
      name: '商品数量',
      type: 'pie',
      data: [
        {
          name: '活跃商品',
          y: stats.activeProducts,
          color: '#4ECDC4',
          sliced: true
        },
        {
          name: '其他商品',
          y: stats.totalProducts - stats.activeProducts,
          color: '#DDA0DD'
        }
      ]
    }],
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b> 个<br/>占比: <b>{point.percentage:.1f}%</b>'
    },
    credits: {
      enabled: false
    }
  };

  // 订单成功率柱状图配置
  const orderSuccessOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      height: 300,
    },
    title: {
      text: '订单统计'
    },
    xAxis: {
      categories: ['总订单', '成功订单'],
      title: {
        text: '订单类型'
      }
    },
    yAxis: {
      title: {
        text: '数量'
      },
      min: 0
    },
    plotOptions: {
      column: {
        borderRadius: 8,
        dataLabels: {
          enabled: true,
          format: '{point.y}'
        }
      }
    },
    series: [{
      name: '订单数量',
      type: 'column',
      data: [
        {
          name: '总订单',
          y: stats.totalOrders,
          color: '#45B7D1'
        },
        {
          name: '成功订单',
          y: stats.successfulOrders,
          color: '#96CEB4'
        }
      ]
    }],
    tooltip: {
      pointFormat: '{point.name}: <b>{point.y}</b> 个'
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">基于 Highcharts 的实时数据可视化</p>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-3xl font-bold">{stats.totalProducts}</div>
          <div className="text-blue-100">总商品数</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-3xl font-bold">{stats.activeProducts}</div>
          <div className="text-green-100">活跃商品</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-3xl font-bold">{stats.totalOrders}</div>
          <div className="text-purple-100">总订单数</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-3xl font-bold">
            {stats.totalOrders > 0 ? Math.round((stats.successfulOrders / stats.totalOrders) * 100) : 0}%
          </div>
          <div className="text-red-100">成功率</div>
        </div>
      </div>

      {/* 图表网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <HighchartsReact
            highcharts={Highcharts}
            options={hourlyOrdersOptions}
            ref={chartRef}
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <HighchartsReact
            highcharts={Highcharts}
            options={productStatusOptions}
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
          <HighchartsReact
            highcharts={Highcharts}
            options={orderSuccessOptions}
          />
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-4">
        数据每分钟自动更新 • 使用 Highcharts 技术驱动
      </div>
    </div>
  );
}
