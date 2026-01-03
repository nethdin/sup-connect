'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types
interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

interface PromptOptions {
    title?: string;
    message: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
}

interface ModalState {
    type: 'confirm' | 'prompt' | null;
    options: ConfirmOptions | PromptOptions | null;
    resolve: ((value: any) => void) | null;
}

interface ModalContextType {
    confirm: (options: ConfirmOptions | string) => Promise<boolean>;
    prompt: (options: PromptOptions | string) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}

// Confirm Dialog Component
function ConfirmDialog({
    options,
    onConfirm,
    onCancel,
}: {
    options: ConfirmOptions;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const variantStyles = {
        danger: {
            icon: 'fa-solid fa-triangle-exclamation text-red-600',
            confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            icon: 'fa-solid fa-bolt text-amber-600',
            confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
        },
        info: {
            icon: 'fa-solid fa-circle-info text-brand-600',
            confirmBtn: 'bg-brand-600 hover:bg-brand-700 text-white',
        },
    };

    const variant = options.variant || 'danger';
    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-fade-in">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <i className={`text-3xl ${styles.icon}`}></i>
                        <div className="flex-1">
                            {options.title && (
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {options.title}
                                </h3>
                            )}
                            <p className="text-gray-600">{options.message}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                    >
                        {options.cancelText || 'Cancel'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 font-medium rounded-lg transition ${styles.confirmBtn}`}
                    >
                        {options.confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Prompt Dialog Component
function PromptDialog({
    options,
    onConfirm,
    onCancel,
}: {
    options: PromptOptions;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}) {
    const [value, setValue] = useState(options.defaultValue || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(value);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-fade-in">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        {options.title && (
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {options.title}
                            </h3>
                        )}
                        <p className="text-gray-600 mb-4">{options.message}</p>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={options.placeholder}
                            autoFocus
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                        >
                            {options.cancelText || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition"
                        >
                            {options.confirmText || 'OK'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Modal Provider
export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalState, setModalState] = useState<ModalState>({
        type: null,
        options: null,
        resolve: null,
    });

    const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
        return new Promise((resolve) => {
            const opts: ConfirmOptions = typeof options === 'string'
                ? { message: options }
                : options;
            setModalState({ type: 'confirm', options: opts, resolve });
        });
    }, []);

    const prompt = useCallback((options: PromptOptions | string): Promise<string | null> => {
        return new Promise((resolve) => {
            const opts: PromptOptions = typeof options === 'string'
                ? { message: options }
                : options;
            setModalState({ type: 'prompt', options: opts, resolve });
        });
    }, []);

    const handleClose = useCallback((result: any) => {
        if (modalState.resolve) {
            modalState.resolve(result);
        }
        setModalState({ type: null, options: null, resolve: null });
    }, [modalState.resolve]);

    return (
        <ModalContext.Provider value={{ confirm, prompt }}>
            {children}

            {modalState.type === 'confirm' && modalState.options && (
                <ConfirmDialog
                    options={modalState.options as ConfirmOptions}
                    onConfirm={() => handleClose(true)}
                    onCancel={() => handleClose(false)}
                />
            )}

            {modalState.type === 'prompt' && modalState.options && (
                <PromptDialog
                    options={modalState.options as PromptOptions}
                    onConfirm={(value) => handleClose(value)}
                    onCancel={() => handleClose(null)}
                />
            )}
        </ModalContext.Provider>
    );
}
