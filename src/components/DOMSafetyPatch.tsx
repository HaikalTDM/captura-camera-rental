'use client';

import { useEffect } from 'react';

/**
 * Defensive runtime patch to make DOM removals idempotent and avoid
 * errors like "Cannot read properties of null (reading 'removeChild')"
 * that can occur during React's commit deletion effects in edge cases.
 */
export default function DOMSafetyPatch() {
  useEffect(() => {
    try {
      const elementProto = (Element as any)?.prototype;
      const nodeProto = (Node as any)?.prototype;
      const documentProto = (Document as any)?.prototype;
      const childNodeProto = (window as any)?.ChildNode?.prototype;

      const patchRemoveChild = (proto: any) => {
        if (!proto || proto.__safeRemoveChildPatched) return;
        const originalRemoveChild = proto.removeChild;
        proto.removeChild = function safeRemoveChild(child: Node) {
          try {
            if (!child) return child;
            if ((child as any).parentNode !== this) return child;
            return originalRemoveChild.call(this, child);
          } catch (err) {
            // Swallow DOM cleanup errors
            return child;
          }
        };
        Object.defineProperty(proto, '__safeRemoveChildPatched', {
          value: true,
          configurable: false,
          enumerable: false,
          writable: false,
        });
      };

      // Patch removeChild on Element, Node and Document
      patchRemoveChild(elementProto);
      patchRemoveChild(nodeProto);
      patchRemoveChild(documentProto);

      const patchRemove = (proto: any) => {
        if (!proto || proto.__safeRemovePatched) return;
        const originalRemove = proto.remove;
        proto.remove = function safeRemove() {
          try {
            if ((this as any).parentNode) {
              (this as any).parentNode.removeChild(this);
              return;
            }
            if (typeof originalRemove === 'function') {
              return originalRemove.call(this);
            }
          } catch {
            // Ignore
          }
        };
        Object.defineProperty(proto, '__safeRemovePatched', {
          value: true,
          configurable: false,
          enumerable: false,
          writable: false,
        });
      };

      // Patch remove on Element and ChildNode
      patchRemove(elementProto);
      patchRemove(childNodeProto);

      if (nodeProto && !nodeProto.__safeAppendChildPatched) {
        const originalAppendChild = nodeProto.appendChild;
        nodeProto.appendChild = function safeAppendChild(child: Node) {
          try {
            // Ensure child is detached from any previous parent first
            const parent = (child as any).parentNode;
            if (parent && parent !== this) {
              try { parent.removeChild(child); } catch {}
            }
            return originalAppendChild.call(this, child);
          } catch (err) {
            // Fallback: ignore
            return child;
          }
        };
        Object.defineProperty(nodeProto, '__safeAppendChildPatched', {
          value: true,
          configurable: false,
          enumerable: false,
          writable: false,
        });
      }
    } catch {
      // Ignore environment without DOM
    }
  }, []);

  return null;
}


