'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { ThemeSelect } from '@/components/theme-select'
import { ClusterUiSelect } from './cluster/cluster-ui'
import { WalletButton } from '@/components/solana/solana-provider'
import { useMovieProgramAccountt } from './movie-review-system/movie-data-access'
import { useAnchorProvider } from './solana/solana-provider'
import { RewardsModal } from './movie-review-system/rewards-modal'


export const MINT_DECIMALS = 9;
export const MINT_DECIMAL_FACTOR = 10 ** MINT_DECIMALS;

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const provider = useAnchorProvider()

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  const { movieReviewRewards } = useMovieProgramAccountt({ account: provider!.wallet!.publicKey! })
  console.log(movieReviewRewards.data?.toString())
  return (
    <header className="relative z-50 px-4 py-2 bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400">
      <div className="mx-auto flex justify-between items-center">
        <div className="flex items-baseline gap-4">
          <Link className="text-xl hover:text-neutral-500 dark:hover:text-white" href="/">
            <span>Movie Review System</span>
          </Link>
          <div className="hidden md:flex items-center">
            <ul className="flex gap-4 flex-nowrap items-center">
              {links.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    className={`hover:text-neutral-500 dark:hover:text-white ${isActive(path) ? 'text-neutral-500 dark:text-white' : ''}`}
                    href={path}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMenu(!showMenu)}>
          {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

          <RewardsModal>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer transition-colors">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Rewards:</span>
              <span className="text-sm font-bold text-green-800 dark:text-green-200">
                {movieReviewRewards.isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : movieReviewRewards.error ? (
                  <span className="text-red-500">Error</span>
                ) : (
                  `${(Number(movieReviewRewards.data || 0) / MINT_DECIMAL_FACTOR).toFixed(2)} AST`
                )}
              </span>
            </div>
          </RewardsModal>

        <div className="hidden md:flex items-center gap-4">
          <WalletButton />
          <ClusterUiSelect />
          <ThemeSelect />
        </div>

        {showMenu && (
          <div className="md:hidden fixed inset-x-0 top-[52px] bottom-0 bg-neutral-100/95 dark:bg-neutral-900/95 backdrop-blur-sm">
            <div className="flex flex-col p-4 gap-4 border-t dark:border-neutral-800">
              <ul className="flex flex-col gap-4">
                {links.map(({ label, path }) => (
                  <li key={path}>
                    <Link
                      className={`hover:text-neutral-500 dark:hover:text-white block text-lg py-2  ${isActive(path) ? 'text-neutral-500 dark:text-white' : ''} `}
                      href={path}
                      onClick={() => setShowMenu(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-4">
                <RewardsModal>
                  <div className="flex items-center justify-between px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer transition-colors">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Rewards:</span>
                    <span className="text-sm font-bold text-green-800 dark:text-green-200">
                      {movieReviewRewards.isLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : movieReviewRewards.error ? (
                        <span className="text-red-500">Error</span>
                      ) : (
                        `${(Number(movieReviewRewards.data || 0) / MINT_DECIMAL_FACTOR).toFixed(2)} AST`
                      )}
                    </span>
                  </div>
                </RewardsModal>
                <WalletButton />
                <ClusterUiSelect />
                <ThemeSelect />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
