'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMovieProgramAccountt } from './movie-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { Gift, Clock, Coins, TrendingUp, Wallet } from 'lucide-react'
import { toast } from 'sonner'

interface RewardsModalProps {
    children: React.ReactNode
}

export function RewardsModal({ children }: RewardsModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const provider = useAnchorProvider()

    const { movieReviewRewards, withDrawTokens, withdrawableAmount } = useMovieProgramAccountt({
        account: provider!.wallet!.publicKey!
    })

    const MINT_DECIMAL_FACTOR = 1_000_000_000 // 9 decimals

    const totalRewards = Number(withdrawableAmount.data || 0) / MINT_DECIMAL_FACTOR
    const isWithdrawing = withDrawTokens.isPending
    const canWithdraw = totalRewards > 0 && !isWithdrawing

    const handleWithdraw = async () => {
        try {
            await withDrawTokens.mutateAsync()
            toast.success('Rewards claimed successfully!')
            setIsOpen(false)
        } catch (error) {
            console.error('Failed to withdraw rewards:', error)
            toast.error('Failed to claim rewards. Please try again.')
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-yellow-500" />
                        Rewards Center
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Total Rewards Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Coins className="h-5 w-5 text-green-500" />
                                Total Rewards
                            </CardTitle>
                            <CardDescription>
                                Your accumulated AST token rewards
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {movieReviewRewards.isLoading ? (
                                        <div className="animate-pulse">Loading...</div>
                                    ) : movieReviewRewards.error ? (
                                        <div className="text-red-500">Error</div>
                                    ) : (
                                        `${totalRewards.toFixed(6)} AST`
                                    )}
                                </div>
                                <Badge variant="secondary" className="mt-2">
                                    <Wallet className="h-3 w-3 mr-1" />
                                    Available to claim
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rewards Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                How to Earn
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Write movie reviews: <strong>5,000 AST</strong> per review</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>Cooldown period: <strong>5 minutes</strong> between claims</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cooldown Status */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                                Claim Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-2">
                                    {canWithdraw ? 'Ready to claim!' : 'Please wait...'}
                                </div>
                                <Badge
                                    variant={canWithdraw ? "default" : "secondary"}
                                    className={canWithdraw ? "bg-green-500 hover:bg-green-600" : ""}
                                >
                                    {canWithdraw ? 'Available' : 'On Cooldown'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={handleWithdraw}
                            disabled={!canWithdraw || isWithdrawing}
                            className="flex-1"
                        >
                            {isWithdrawing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Claiming...
                                </>
                            ) : (
                                <>
                                    <Gift className="h-4 w-4 mr-2" />
                                    Claim Rewards
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                        >
                            Close
                        </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                        <p>Rewards are automatically calculated and added to your vault when you create or update reviews.</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
