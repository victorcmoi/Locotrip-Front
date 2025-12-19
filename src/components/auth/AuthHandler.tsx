'use client';

import { signOut, useSession } from 'next-auth/react';
import { ReactNode, useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import dayjs from "@/lib/dayjs";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const EXPIRATION_MODAL_MINUTES = 5;

export default function AuthHandler({ children }: { children: ReactNode }) {
  const session = useSession();

  const [open, setOpen] = useState(false);
  const [sessionExpirationDuration, setSessionExpirationDuration] = useState(0);
  const [sessionExpires, setSessionExpires] = useState(-1);

  const remainingTime = (expiration: Date) => dayjs(expiration).diff(dayjs(), 'seconds');

  useEffect(() => {
    const jwt = session.data?.accessToken;

    let timeout: NodeJS.Timeout;

    if (jwt && sessionExpires < 0) {
      const decoded = jwtDecode(jwt);
      const expiration = new Date(0);
      expiration.setUTCSeconds(decoded.exp ?? 0);

      timeout = setTimeout(() => {
        setSessionExpirationDuration(remainingTime(expiration));
        setSessionExpires(remainingTime(expiration));
        setOpen(true);
      }, (remainingTime(expiration) - (EXPIRATION_MODAL_MINUTES * 60)) * 1000);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [session, sessionExpires]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (sessionExpirationDuration) {
      interval = setInterval(() => {
        if (sessionExpires > 0) {
          setSessionExpires(sessionExpires - 1);
        } else {
          setOpen(true);
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [sessionExpirationDuration, sessionExpires]);

  return (
    <>
      {children}
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div>
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-yellow-100">
                  <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-yellow-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                    Expiration de votre session
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {sessionExpires <= 0 ? 'Votre session a expiré, veuillez vous reconnecter.' : `Attention ! Votre session expire dans ${new Date(sessionExpires * 1000).toISOString().slice(11, 19)}`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex w-full justify-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                >
                  Se connecter
                </button>
                {sessionExpires > 0 && (
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  >
                    Ignorer
                  </button>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
