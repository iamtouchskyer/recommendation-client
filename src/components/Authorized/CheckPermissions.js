/*
 * 通用权限检查类
 * @Author: jim chen
 * @Date: 2018-01-02 09:54:18
 * @Last Modified by: jim chen
 * @Last Modified time: 2018-01-04 16:50:42
 */
import React from 'react';
import PromiseRender from './PromiseRender';
import { CURRENT } from './index';
/**
 * 通用权限检查方法
 * Common check permissions method
 * @param { 权限判定 Permission judgment type string |array | Promise | Function } authority
 * @param { 你的权限 Your permission description  type:string} currentAuthority
 * @param { 通过的组件 Passing components } target
 * @param { 未通过的组件 no pass components } Exception
 */
const checkPermissions = (authority, currentAuthority, target, Exception) => {
  // 没有判定权限.默认查看所有
  // Retirement authority, return target;
  if (!authority) {
    return target;
  }
  // 数组处理
  if (authority.constructor.name === 'Array') {
    if (authority.includes(currentAuthority)) {
      return target;
    }
    return Exception;
  }

  // string 处理
  if (authority.constructor.name === 'String') {
    if (authority === currentAuthority) {
      return target;
    }
    return Exception;
  }

  // Promise 处理
  if (authority.constructor.name === 'Promise') {
    return () => (
      <PromiseRender ok={target} error={Exception} promise={authority} />
    );
  }

  // Function 处理
  if (authority.constructor.name === 'Function') {
    try {
      const bool = authority();
      if (bool) {
        return target;
      }
      return Exception;
    } catch (e) {
      return Exception;
    }
  }
};

export { checkPermissions };

const checkPermissionsCURRENT = (authority, target, Exception) => {
  return checkPermissions(authority, CURRENT, target, Exception);
};

export default checkPermissionsCURRENT;