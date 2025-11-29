"use client";

import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiInstance,
  Options as ConfettiOptions,
} from 'canvas-confetti';
import confetti from 'canvas-confetti';

// Minimal button replacement (avoid importing external button component)
interface SimpleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}
const SimpleButton = ({ children, className = '', ...rest }: SimpleButtonProps) => (
  <button
    className={
      'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium bg-[#2466FF] text-white hover:bg-[#1557EE] transition-colors ' +
      className
    }
    {...rest}
  >
    {children}
  </button>
);

type Api = { fire: (options?: ConfettiOptions) => void };

type Props = React.ComponentPropsWithRef<'canvas'> & {
  options?: ConfettiOptions;
  globalOptions?: ConfettiGlobalOptions;
  manualstart?: boolean;
  children?: ReactNode;
};

export type ConfettiRef = Api | null;

const ConfettiContext = createContext<Api>({} as Api);

const ConfettiComponent = forwardRef<ConfettiRef, Props>((props, ref) => {
  const {
    options = {},
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    children,
    ...rest
  } = props;
  const instanceRef = useRef<ConfettiInstance | null>(null);

  const canvasRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (node !== null) {
        if (instanceRef.current) return;
        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true,
        });
      } else {
        if (instanceRef.current) {
          instanceRef.current.reset();
          instanceRef.current = null;
        }
      }
    },
    [globalOptions]
  );

  const fire = useCallback(
    async (opts: ConfettiOptions = {}) => {
      try {
        await instanceRef.current?.({ ...options, ...opts });
      } catch (error) {
        console.error('Confetti error:', error);
      }
    },
    [options]
  );

  const api = useMemo(
    () => ({
      fire,
    }),
    [fire]
  );

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    if (!manualstart) {
      (async () => {
        try {
          await fire();
        } catch (error) {
          console.error('Confetti effect error:', error);
        }
      })();
    }
  }, [manualstart, fire]);

  return (
    <ConfettiContext.Provider value={api}>
      <canvas 
        ref={canvasRef} 
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
        {...rest} 
      />
      {children}
    </ConfettiContext.Provider>
  );
});
ConfettiComponent.displayName = 'Confetti';
export const Confetti = ConfettiComponent;

interface ConfettiButtonProps extends React.ComponentProps<'button'> {
  options?: ConfettiOptions & ConfettiGlobalOptions & { canvas?: HTMLCanvasElement };
}

const ConfettiButtonComponent = ({ options, children, ...props }: ConfettiButtonProps) => {
  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      await confetti({
        ...options,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
      });
    } catch (error) {
      console.error('Confetti button error:', error);
    }
  };

  return (
    <SimpleButton onClick={handleClick} {...props}>
      {children}
    </SimpleButton>
  );
};
ConfettiButtonComponent.displayName = 'ConfettiButton';
export const ConfettiButton = ConfettiButtonComponent;
