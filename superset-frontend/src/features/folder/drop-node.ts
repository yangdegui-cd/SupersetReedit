import {DataNode} from "antd/lib/tree";
import {Dispatch, SetStateAction} from "react";

export const nodeDrop = (info: any, treeData: DataNode[], setTreeData: Dispatch<SetStateAction<DataNode[]>>) => {
  const dropKey = info.node.key;
  const dragKey = info.dragNode.key;
  const dropToGap = info.dropToGap as boolean

// 插入节点的逻辑
  function insertNode(data: DataNode[], dragNode: DataNode, dropKey: string, dropToGap: boolean): void {
    let dropNode: DataNode | undefined = findNode(data, dropKey);
    let parentNode: DataNode | undefined = findParentNode(data, dropKey);

    if (!dropNode) return;
    // 目标是文件夹，拖拽的是文件，且放在文件夹外部的情况，不执行操作
    if (!dropNode.isLeaf && dropToGap && dragNode.isLeaf) return;
    removeNode(treeData, dragKey);

    // 拖拽节点和目标节点都是文件，或者目标是文件夹但放在内部
    if (parentNode) {
      // 目标节点有父节点，意味着不在根目录
      const index = parentNode.children!.findIndex(node => node.key === dropKey);

      if (dragNode.isLeaf && dropNode.isLeaf) {
        // 拖拽节点和目标节点都是文件
        parentNode.children!.splice(index + 1, 0, dragNode); // 放在目标节点后
      } else if (!dropNode.isLeaf && dropToGap) {
        // 目标节点是文件夹，且dropToGap为true（外部）
        parentNode.children!.splice(index + 1, 0, dragNode); // 放在目标节点后
      } else if (!dropNode.isLeaf && !dropToGap) {
        // 目标节点是文件夹，且dropToGap为false（内部）
        if (dragNode.isLeaf) {
          // 拖拽节点是文件
          dropNode.children = dropNode.children || [];
          dropNode.children.push(dragNode); // 放在文件夹最末尾
        } else {
          // 拖拽节点是文件夹
          dropNode.children = dropNode.children || [];
          dropNode.children.unshift(dragNode); // 放在文件夹首位
        }
      }
    } else {
      const index = data.findIndex(node => node.key === dropKey);
      if (dragNode.isLeaf && dropNode.isLeaf) {
        // 拖拽节点和目标节点都是文件
        data!.splice(index + 1, 0, dragNode); // 放在目标节点后
      } else if (!dropNode.isLeaf && dropToGap) {
        // 目标节点是文件夹，且dropToGap为true（外部）
        data!.splice(index + 1, 0, dragNode); // 放在目标节点后
      } else if (!dropNode.isLeaf && !dropToGap) {
        // 目标节点是文件夹，且dropToGap为false（内部）
        if (dragNode.isLeaf) {
          // 拖拽节点是文件
          dropNode.children = dropNode.children || [];
          dropNode.children.push(dragNode); // 放在文件夹最末尾
        } else {
          // 拖拽节点是文件夹
          dropNode.children = dropNode.children || [];
          dropNode.children.unshift(dragNode); // 放在文件夹首位
        }
      }
    }
  }

  function findNode(data: DataNode[], key: string): DataNode | undefined {
    let node;
    for (const item of data) {
      if (item.key === key) {
        return item;
      } else if (item.children) {
        node = findNode(item.children, key);
        if (node) return node;
      }
    }
    return undefined;
  }

  // 删除拖动节点的函数...
  function removeNode(data: DataNode[], key: string): void {
    for (let i = 0; i < data.length; i++) {
      if (data[i].key === key) {
        data.splice(i, 1);
        return;
      } else if (data[i].children) {
        removeNode(data[i].children as DataNode[], key);
      }
    }
  }

  // 找到父节点的函数
  function findParentNode(data: DataNode[], key: string, parent: DataNode | undefined = undefined): DataNode | undefined {
    for (const item of data) {
      if (item.key === key) {
        return parent;
      } else if (item.children) {
        const result = findParentNode(item.children, key, item);
        if (result) return result;
      }
    }
    return undefined;
  }

  // 找到拖动的节点
  let dragNode = findNode(treeData, dragKey);
  if (dragNode) {
    insertNode(treeData, dragNode, dropKey, dropToGap); // 再插入
  }
  // 更新树状数据
  setTreeData([...treeData]);
};
