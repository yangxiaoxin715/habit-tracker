"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // 获取localStorage信息
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    setDebugInfo({
      hasToken: !!token,
      token: token ? token.substring(0, 50) + '...' : null,
      user: user ? JSON.parse(user) : null,
      localStorage: {
        length: localStorage.length,
        keys: Object.keys(localStorage)
      }
    });
  }, []);

  const testAPI = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('没有token');
      return;
    }

    try {
      const response = await fetch('/api/tasks/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('API响应:', data);
      alert(`API响应: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('API测试失败:', error);
      alert(`API测试失败: ${error}`);
    }
  };

  const quickLogin = async () => {
    try {
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '13800138000',
          name: '演示用户',
          role: 'PARENT'
        })
      });

      const data = await response.json();
      console.log('登录响应:', data);

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // 更新调试信息
        setDebugInfo({
          hasToken: true,
          token: data.token.substring(0, 50) + '...',
          user: data.user,
          localStorage: {
            length: localStorage.length,
            keys: Object.keys(localStorage)
          }
        });
        
        alert('登录成功！');
      } else {
        alert(`登录失败: ${data.message}`);
      }
    } catch (error) {
      console.error('登录失败:', error);
      alert(`登录失败: ${error}`);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">调试页面</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">调试信息:</h2>
          <pre className="text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
        
        <div className="space-x-2">
          <Button onClick={quickLogin}>快速登录</Button>
          <Button onClick={testAPI}>测试API</Button>
          <Button onClick={() => window.location.reload()}>刷新页面</Button>
        </div>
      </div>
    </div>
  );
} 