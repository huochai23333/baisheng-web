"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseWholesaleOrderCreateSubmissionInput = {
  onCreateOrder: (formData: FormData) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pending: boolean;
};

/**
 * 管理一次“新建批发订单”操作从打开弹窗到列表刷新完成的完整生命周期。
 *
 * 请求编号必须在失败重试时保持不变：如果数据库其实已经保存成功、只是浏览器
 * 没收到响应，再次提交同一个编号时数据库会返回原订单，而不是新增第二笔。
 */
export function useWholesaleOrderCreateSubmission({
  onCreateOrder,
  onOpenChange,
  open,
  pending,
}: UseWholesaleOrderCreateSubmissionInput) {
  const requestIdRef = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && !requestIdRef.current) {
      requestIdRef.current = createCreationRequestId();
    }

    // 主动取消代表这次草稿已经结束。下次打开必须使用新的请求编号，
    // 才能让两笔内容相同但业务上独立的订单正常分别创建。
    if (!open && !submittingRef.current) {
      requestIdRef.current = null;
    }
  }, [open]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      // 保存和刷新期间不关闭弹窗，避免用户误以为没有响应后立即重新打开再提交。
      if (!nextOpen && (submittingRef.current || pending)) return;
      onOpenChange(nextOpen);
    },
    [onOpenChange, pending],
  );

  const submit = useCallback(
    async (form: HTMLFormElement) => {
      // ref 会在同一个浏览器事件周期内立即生效，弥补 React 状态异步更新的时间差。
      if (submittingRef.current || pending) return false;

      submittingRef.current = true;
      setSubmitting(true);

      try {
        const formData = new FormData(form);
        const requestId =
          requestIdRef.current ?? createCreationRequestId();
        requestIdRef.current = requestId;
        formData.set("creation_request_id", requestId);

        const succeeded = await onCreateOrder(formData);
        if (!succeeded) return false;

        form.reset();
        requestIdRef.current = null;
        submittingRef.current = false;
        onOpenChange(false);
        return true;
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [onCreateOrder, onOpenChange, pending],
  );

  return {
    handleOpenChange,
    pending: pending || submitting,
    submit,
  };
}

function createCreationRequestId() {
  // 现代浏览器原生生成随机 UUID，不需要把账号、时间或表单内容放进请求编号。
  return globalThis.crypto.randomUUID();
}
