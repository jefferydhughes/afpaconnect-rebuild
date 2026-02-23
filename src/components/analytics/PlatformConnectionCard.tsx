'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export interface PlatformConnection {
  id?: string
  platform: string
  status: 'connected' | 'disconnected' | 'error' | 'expired'
  account_name?: string | null
  last_sync_at?: string | null
  sync_frequency?: string | null
  error_message?: string | null
}

interface Props {
  connection: PlatformConnection
  onConnect: (platform: string) => void
  onSync: (connection: PlatformConnection) => void
  onDisconnect: (connection: PlatformConnection) => void
  isLoading?: boolean
}

const PLATFORM_ICONS: Record<string, string> = {
  google_my_business: '🗺️',
  meta_ads: '📘',
  google_ads: '🔍',
  google_analytics: '📊',
  linkedin_ads: '💼',
}

const PLATFORM_NAMES: Record<string, string> = {
  google_my_business: 'Google My Business',
  meta_ads: 'Meta Ads (Facebook/Instagram)',
  google_ads: 'Google Ads',
  google_analytics: 'Google Analytics',
  linkedin_ads: 'LinkedIn Ads',
}

const STATUS_STYLES: Record<string, string> = {
  connected: 'bg-green-100 text-green-700',
  disconnected: 'bg-gray-100 text-gray-600',
  error: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-700',
}

export default function PlatformConnectionCard({
  connection,
  onConnect,
  onSync,
  onDisconnect,
  isLoading = false,
}: Props) {
  const status = connection.status || 'disconnected'
  const isConnected = status === 'connected'

  const StatusIcon =
    status === 'connected'
      ? CheckCircle2
      : status === 'error' || status === 'expired'
      ? AlertCircle
      : XCircle

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{PLATFORM_ICONS[connection.platform]}</span>
            <div>
              <CardTitle className="text-base leading-tight">
                {PLATFORM_NAMES[connection.platform]}
              </CardTitle>
              {connection.account_name && (
                <p className="text-sm text-gray-500 mt-0.5">{connection.account_name}</p>
              )}
            </div>
          </div>
          <Badge className={`${STATUS_STYLES[status]} border-0 shrink-0 flex items-center gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isConnected ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-500 space-y-0.5">
              {connection.last_sync_at && (
                <p>
                  Last synced:{' '}
                  {new Date(connection.last_sync_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              )}
              {connection.sync_frequency && (
                <p className="capitalize">Frequency: {connection.sync_frequency}</p>
              )}
            </div>

            {connection.error_message && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
                {connection.error_message}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSync(connection)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                )}
                Sync Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:border-red-300"
                onClick={() => onDisconnect(connection)}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Connect your {PLATFORM_NAMES[connection.platform]} account to start tracking
              performance.
            </p>
            {connection.error_message && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800">
                {connection.error_message}
              </div>
            )}
            <Button
              onClick={() => onConnect(connection.platform)}
              disabled={isLoading}
              className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light w-full"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Connect {PLATFORM_NAMES[connection.platform]}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
