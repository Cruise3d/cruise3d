import { useCallback, useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { fetchAdminContactMessages } from '../api'
import type { AdminContactMessage } from '../types'
import { theme } from '../../../styles/theme'

function formatCreatedDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function AdminContactMessagesPage() {
  const { colors, shadows } = theme
  const [messages, setMessages] = useState<AdminContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setMessages(await fetchAdminContactMessages())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contact messages')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMessages()
  }, [loadMessages])

  return (
    <AdminLayout
      title="Contact Messages"
      description="Review messages submitted through the storefront contact form."
    >
      {isLoading ? (
        <div
          className="rounded-[1.5rem] border p-8 text-center"
          style={{
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface.DEFAULT,
            color: colors.text.secondary,
          }}
        >
          Loading contact messages...
        </div>
      ) : error ? (
        <div
          className="rounded-[1.5rem] border p-4"
          style={{
            borderColor: colors.status.error.DEFAULT,
            backgroundColor: colors.status.error.light,
            color: colors.status.error.text,
          }}
        >
          {error}
          <button
            onClick={() => void loadMessages()}
            className="ml-2 underline"
            style={{ color: colors.primary.DEFAULT }}
          >
            Try again
          </button>
        </div>
      ) : messages.length === 0 ? (
        <div
          className="rounded-[1.5rem] border p-8 text-center"
          style={{
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface.DEFAULT,
            color: colors.text.secondary,
            boxShadow: shadows.DEFAULT,
          }}
        >
          No contact messages found.
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-[1.5rem] border"
          style={{
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface.DEFAULT,
            boxShadow: shadows.DEFAULT,
          }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead
                style={{
                  backgroundColor: colors.surface.low,
                  color: colors.text.secondary,
                }}
              >
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr
                    key={message.id}
                    className="border-t align-top"
                    style={{ borderColor: colors.border.DEFAULT }}
                  >
                    <td
                      className="px-4 py-4 font-medium"
                      style={{ color: colors.text.primary }}
                    >
                      {message.fullName}
                    </td>
                    <td className="px-4 py-4" style={{ color: colors.text.secondary }}>
                      <a
                        href={`mailto:${message.email}`}
                        className="hover:underline"
                        style={{ color: colors.primary.DEFAULT }}
                      >
                        {message.email}
                      </a>
                    </td>
                    <td
                      className="max-w-[220px] px-4 py-4 font-medium"
                      style={{ color: colors.text.primary }}
                    >
                      {message.subject}
                    </td>
                    <td
                      className="max-w-[360px] whitespace-pre-wrap px-4 py-4 leading-6"
                      style={{ color: colors.text.secondary }}
                    >
                      {message.message}
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-4"
                      style={{ color: colors.text.secondary }}
                    >
                      {formatCreatedDate(message.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
                        style={{
                          backgroundColor: message.isRead
                            ? colors.surface.tint
                            : colors.status.info.light,
                          color: message.isRead
                            ? colors.text.secondary
                            : colors.status.info.text,
                        }}
                      >
                        {message.isRead ? 'Read' : 'Unread'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
