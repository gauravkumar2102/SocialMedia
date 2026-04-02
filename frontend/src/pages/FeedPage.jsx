import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Box, Typography, Avatar, TextField, IconButton, Card, CardContent,
  Skeleton, Fab, Drawer, Button, Divider, CircularProgress,
  InputAdornment, Chip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined'
import NotesIcon from '@mui/icons-material/Notes'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import SendIcon from '@mui/icons-material/Send'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import AddIcon from '@mui/icons-material/Add'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import LanguageIcon from '@mui/icons-material/Language'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CloseIcon from '@mui/icons-material/Close'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import { getPosts, createPost, likePost, commentOnPost, deletePost } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// ─── Helpers ────────────────────────────────────────────────────────────────
const PALETTE = ['#F4A940', '#E8534A', '#4CAF82', '#1877F2', '#9C27B0', '#FF5722', '#00BCD4']
const getColor = (name = '') => PALETTE[name.charCodeAt(0) % PALETTE.length]

const FILTER_TABS = ['All Post', 'For You', 'Most Liked', 'Most Commented', 'Most Shared']

const fmtTime = (d) => {
  const date = new Date(d)
  return date.toLocaleString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

// ─── PostCard ────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onDelete }) {
  const [likes, setLikes] = useState(post.likes || [])
  const [likedBy, setLikedBy] = useState(post.likedBy || [])
  const [comments, setComments] = useState(post.comments || [])
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [likeBusy, setLikeBusy] = useState(false)
  const [commentBusy, setCommentBusy] = useState(false)

  const isLiked = currentUser && likedBy.some((id) => id?.toString?.() === currentUser._id || id === currentUser._id)
  const isOwner = currentUser && (post.userId?.toString?.() === currentUser._id || post.userId === currentUser._id)

  const handleLike = async () => {
    if (!currentUser) return toast.info('Login to like')
    if (likeBusy) return
    setLikeBusy(true)
    try {
      const res = await likePost(post._id)
      setLikes(res.data.likes)
      setLikedBy(res.data.likedBy)
    } catch { toast.error('Could not like') }
    finally { setLikeBusy(false) }
  }

  const handleComment = async () => {
    if (!currentUser) return toast.info('Login to comment')
    if (!commentText.trim()) return
    setCommentBusy(true)
    try {
      const res = await commentOnPost(post._id, commentText.trim())
      setComments((p) => [...p, res.data.comment])
      setCommentText('')
    } catch { toast.error('Could not comment') }
    finally { setCommentBusy(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    try {
      await deletePost(post._id)
      toast.success('Post deleted')
      onDelete(post._id)
    } catch { toast.error('Could not delete') }
  }

  return (
    <Card sx={{ mb: 1.5, borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      <CardContent sx={{ p: 2, pb: '12px !important' }}>

        {/* ── Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar sx={{
            width: 46, height: 46, mr: 1.5, fontWeight: 700, fontSize: '1.1rem',
            bgcolor: getColor(post.username),
          }}>
            {post.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
              <Typography fontWeight={700} fontSize="0.93rem" noWrap>{post.username}</Typography>
              <Typography fontSize="0.78rem" color="text.secondary" noWrap>
                @{post.username.toLowerCase().replace(/\s/g, '')}
              </Typography>
            </Box>
            <Typography fontSize="0.74rem" color="text.secondary">{fmtTime(post.createdAt)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
            {!isOwner && (
              <Button size="small" variant="contained"
                startIcon={<PersonAddOutlinedIcon sx={{ fontSize: '0.8rem !important' }} />}
                sx={{ py: 0.4, px: 1.4, fontSize: '0.76rem', borderRadius: 20, minWidth: 0 }}>
                Follow
              </Button>
            )}
            {isOwner && (
              <IconButton size="small" onClick={handleDelete}
                sx={{ color: '#ccc', '&:hover': { color: '#E8534A' } }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {post.text && (
          <Typography fontSize="0.92rem" color="text.primary" sx={{ mb: post.image ? 1.2 : 0.5, lineHeight: 1.65 }}>
            {post.text}
          </Typography>
        )}

        {post.image && (
          <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 1.2 }}>
            <img src={post.image} alt="post" loading="lazy"
              style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} />
          </Box>
        )}

        <Divider sx={{ my: 1.2 }} />

        {/* ── Actions ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Like */}
          <Box onClick={handleLike}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.6, cursor: 'pointer',
              color: isLiked ? '#E8534A' : '#65676B', userSelect: 'none',
              '&:hover': { color: '#E8534A' }, transition: 'color .18s'
            }}>
            {isLiked
              ? <FavoriteIcon sx={{ fontSize: 20 }} />
              : <FavoriteBorderIcon sx={{ fontSize: 20 }} />}
            <Typography fontSize="0.85rem" fontWeight={500}>{likes.length}</Typography>
          </Box>
          {/* Comment */}
          <Box onClick={() => setShowComments(!showComments)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.6, cursor: 'pointer',
              color: showComments ? '#1877F2' : '#65676B', userSelect: 'none',
              '&:hover': { color: '#1877F2' }, transition: 'color .18s'
            }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />
            <Typography fontSize="0.85rem" fontWeight={500}>{comments.length}</Typography>
          </Box>
          {/* Share */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.6, cursor: 'pointer',
            color: '#65676B', userSelect: 'none',
            '&:hover': { color: '#1877F2' }, transition: 'color .18s'
          }}>
            <ShareOutlinedIcon sx={{ fontSize: 20 }} />
            <Typography fontSize="0.85rem" fontWeight={500}>0</Typography>
          </Box>
        </Box>

        {showComments && (
          <Box sx={{ mt: 1.5 }}>
            <Divider sx={{ mb: 1.5 }} />
            {comments.length > 0 ? (
              <Box sx={{
                maxHeight: 220, overflowY: 'auto', mb: 1.5,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#E0E0E0', borderRadius: 4 }
              }}>
                {comments.map((c, i) => (
                  <Box key={c._id || i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: getColor(c.username), fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>
                      {c.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ bgcolor: '#F0F2F5', borderRadius: '0 12px 12px 12px', px: 1.5, py: 0.8, flex: 1 }}>
                      <Typography fontSize="0.76rem" fontWeight={700} color="#1877F2">{c.username}</Typography>
                      <Typography fontSize="0.84rem" color="text.primary">{c.text}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography fontSize="0.8rem" color="text.secondary" textAlign="center" sx={{ mb: 1.5 }}>
                No comments yet – be first! 💬
              </Typography>
            )}

            {currentUser && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar sx={{ width: 30, height: 30, bgcolor: getColor(currentUser.username), fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                  {currentUser.username?.[0]?.toUpperCase()}
                </Avatar>
                <TextField fullWidth size="small"
                  placeholder="Write a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment() } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 20, bgcolor: '#F0F2F5', '& fieldset': { border: 'none' }, fontSize: '0.85rem' } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleComment}
                          disabled={!commentText.trim() || commentBusy}
                          sx={{ color: '#1877F2' }}>
                          {commentBusy
                            ? <CircularProgress size={14} />
                            : <SendIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }} />
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Create Post Drawer ───────────────────────────────────────────────────────
function CreatePostDrawer({ open, onClose, onCreated, user }) {
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
    setImage(file)
    const r = new FileReader()
    r.onloadend = () => setPreview(r.result)
    r.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null); setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleClose = () => {
    if (!loading) { setText(''); removeImage(); onClose() }
  }

  const handlePost = async () => {
    if (!text.trim() && !image) { toast.warn('Add text or an image'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      if (text.trim()) fd.append('text', text.trim())
      if (image) fd.append('image', image)
      const res = await createPost(fd)
      onCreated(res.data)
      setText(''); removeImage(); onClose()
      toast.success('Post shared! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post')
    } finally { setLoading(false) }
  }

  return (
    <Drawer anchor="bottom" open={open} onClose={handleClose}
      PaperProps={{ sx: { borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '88vh' } }}>
      <Box sx={{ p: 2.5 }}>
        {/* Drag handle */}
        <Box sx={{ width: 40, height: 4, bgcolor: '#E0E0E0', borderRadius: 2, mx: 'auto', mb: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography fontWeight={700} fontSize="1.05rem">Create Post</Typography>
          <IconButton size="small" onClick={handleClose} sx={{ bgcolor: '#F0F2F5' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* User info */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Avatar sx={{ width: 44, height: 44, bgcolor: getColor(user?.username), fontWeight: 700, fontSize: '1.1rem' }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography fontWeight={700} fontSize="0.92rem">{user?.username}</Typography>
            <Typography fontSize="0.74rem" color="text.secondary">
              @{user?.username?.toLowerCase()}
            </Typography>
          </Box>
        </Box>

        {/* Text area */}
        <TextField fullWidth multiline minRows={3} maxRows={8}
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          inputProps={{ maxLength: 1000 }}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3, bgcolor: '#F8F9FA',
              '& fieldset': { borderColor: '#E0E0E0' },
              '&.Mui-focused fieldset': { borderColor: '#1877F2', borderWidth: 2 },
            },
          }} />


        {text.length > 800 && (
          <Typography variant="caption" color={text.length > 950 ? 'error' : 'text.secondary'}
            sx={{ display: 'block', textAlign: 'right', mb: 1, mt: -1 }}>
            {text.length}/1000
          </Typography>
        )}


        {preview && (
          <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', mb: 1.5 }}>
            <img src={preview} alt="preview"
              style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
            <IconButton size="small" onClick={removeImage}
              sx={{
                position: 'absolute', top: 8, right: 8,
                bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
                '&:hover': { bgcolor: 'rgba(220,50,50,0.85)' }
              }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage} />

        <Divider sx={{ mb: 1.5 }} />


        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={() => fileRef.current?.click()}
            sx={{ color: image ? '#1877F2' : '#65676B', bgcolor: image ? '#EBF3FF' : 'transparent', borderRadius: 2 }}>
            <CameraAltOutlinedIcon />
          </IconButton>
          <IconButton size="small" sx={{ color: '#65676B', borderRadius: 2 }}>
            <EmojiEmotionsOutlinedIcon />
          </IconButton>
          <IconButton size="small" sx={{ color: '#65676B', borderRadius: 2 }}>
            <NotesIcon />
          </IconButton>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.3, px: 1, cursor: 'pointer',
            color: '#1877F2', '&:hover': { bgcolor: '#F0F2F5' }, borderRadius: 2, py: 0.5
          }}>
            <CampaignOutlinedIcon fontSize="small" />
            <Typography fontSize="0.8rem" fontWeight={600}>Promote</Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" onClick={handlePost}
            disabled={loading || (!text.trim() && !image)}
            endIcon={loading
              ? <CircularProgress size={14} color="inherit" />
              : <SendIcon sx={{ fontSize: '0.85rem !important' }} />}
            sx={{ borderRadius: 20, py: 0.8, px: 2.5, fontSize: '0.85rem' }}>
            {loading ? 'Posting…' : 'Post'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

function PostSkeleton() {
  return (
    <Card sx={{ mb: 1.5, borderRadius: '16px' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
          <Skeleton variant="circular" width={46} height={46} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="30%" />
          </Box>
        </Box>
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2, mt: 1.2 }} />
      </CardContent>
    </Card>
  )
}

export default function FeedPage() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeTab, setActiveTab] = useState('All Post')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  const fetchPosts = useCallback(async (pageNum = 1, replace = true) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)
      const res = await getPosts(pageNum, 10)
      setPosts((p) => replace ? res.data.posts : [...p, ...res.data.posts])
      setTotalPages(res.data.totalPages)
      setPage(pageNum)
    } catch { toast.error('Failed to load posts') }
    finally { setLoading(false); setLoadingMore(false) }
  }, [])

  useEffect(() => { fetchPosts(1, true) }, [fetchPosts])

  const displayPosts = useMemo(() => {
    let list = [...posts]
    if (searchText.trim()) {
      const q = searchText.toLowerCase()
      list = list.filter((p) =>
        p.username?.toLowerCase().includes(q) || p.text?.toLowerCase().includes(q)
      )
    }
    if (activeTab === 'Most Liked') list.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    if (activeTab === 'Most Commented') list.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
    return list
  }, [posts, activeTab, searchText])

  const handleLogout = () => { logoutUser(); navigate('/login') }

  return (
    <Box sx={{ bgcolor: '#F0F2F5', minHeight: '100vh', pb: 10 }}>
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 100,
        bgcolor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        px: 2, py: 1.2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Typography fontWeight={800} fontSize="1.1rem">Social</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            border: '1.5px solid #E0E0E0', borderRadius: 20, px: 1.2, py: 0.3
          }}>
            <Typography fontSize="0.82rem" fontWeight={700}>50</Typography>
            <Typography fontSize="0.88rem">⭐</Typography>
          </Box>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.3,
            border: '1.5px solid #4CAF50', borderRadius: 20, px: 1.2, py: 0.3
          }}>
            <Typography fontSize="0.82rem" fontWeight={600} color="#4CAF50">₹0.00</Typography>
          </Box>
          <IconButton size="small" sx={{ position: 'relative' }}>
            <NotificationsNoneIcon sx={{ fontSize: 22 }} />
            <Box sx={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, bgcolor: '#E8534A',
              borderRadius: '50%', border: '1.5px solid #fff'
            }} />
          </IconButton>
          <Avatar onClick={handleLogout}
            sx={{
              width: 32, height: 32, bgcolor: getColor(user?.username),
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
            }}
            title="Tap to logout">
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 620, mx: 'auto', px: { xs: 1.2, sm: 2 }, pt: 2 }}>


        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TextField fullWidth size="small"
            placeholder="Search promotions, users, posts..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 24, bgcolor: '#F0F2F5',
                '& fieldset': { border: 'none' }, fontSize: '0.87rem',
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{
                    bgcolor: '#1877F2', borderRadius: '50%', width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}>
                    <SearchIcon sx={{ color: '#fff', fontSize: 17 }} />
                  </Box>
                </InputAdornment>
              ),
            }} />
          <IconButton sx={{ bgcolor: '#fff', border: '1px solid #E0E0E0', borderRadius: 2, p: 1, flexShrink: 0 }}>
            <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Avatar sx={{
            width: 36, height: 36, bgcolor: getColor(user?.username),
            fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
        </Box>


        <Card sx={{ mb: 2, borderRadius: '16px' }}>
          <CardContent sx={{ p: 2, pb: '12px !important' }}>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography fontWeight={700} fontSize="0.95rem">Create Post</Typography>
              <Box sx={{ display: 'flex', bgcolor: '#F0F2F5', borderRadius: 20, p: 0.4, gap: 0.4 }}>
                {['All Posts', 'Promotions'].map((t) => (
                  <Box key={t} sx={{
                    px: 1.5, py: 0.35, borderRadius: 20, cursor: 'pointer',
                    bgcolor: t === 'All Posts' ? '#1877F2' : 'transparent',
                  }}>
                    <Typography fontSize="0.76rem" fontWeight={600}
                      color={t === 'All Posts' ? '#fff' : 'text.secondary'}>
                      {t}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>


            <Box onClick={() => setDrawerOpen(true)}
              sx={{
                bgcolor: '#F0F2F5', borderRadius: 2, px: 2, py: 1.4,
                cursor: 'text', mb: 1.5, transition: 'background .15s',
                '&:hover': { bgcolor: '#E8EAED' }
              }}>
              <Typography color="text.secondary" fontSize="0.9rem">What's on your mind?</Typography>
            </Box>

            <Divider sx={{ mb: 1.5 }} />


            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size="small" onClick={() => setDrawerOpen(true)} sx={{ color: '#1877F2' }}>
                <CameraAltOutlinedIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: '#65676B' }}>
                <EmojiEmotionsOutlinedIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: '#65676B' }}>
                <NotesIcon />
              </IconButton>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.3, px: 1,
                color: '#1877F2', cursor: 'pointer', '&:hover': { bgcolor: '#F0F2F5' }, borderRadius: 2, py: 0.5
              }}>
                <CampaignOutlinedIcon fontSize="small" />
                <Typography fontSize="0.8rem" fontWeight={600}>Promote</Typography>
              </Box>
              <Box sx={{ flex: 1 }} />
              <Button variant="contained" onClick={() => setDrawerOpen(true)}
                endIcon={<SendIcon sx={{ fontSize: '0.82rem !important' }} />}
                sx={{ borderRadius: 20, py: 0.6, px: 2, fontSize: '0.82rem' }}>
                Post
              </Button>
            </Box>
          </CardContent>
        </Card>


        <Box sx={{
          display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 1.5,
          '&::-webkit-scrollbar': { display: 'none' }
        }}>
          {FILTER_TABS.map((tab) => (
            <Chip key={tab} label={tab} onClick={() => setActiveTab(tab)}
              sx={{
                whiteSpace: 'nowrap', borderRadius: 20, cursor: 'pointer',
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: '0.8rem', height: 34,
                bgcolor: activeTab === tab ? '#1877F2' : '#fff',
                color: activeTab === tab ? '#fff' : 'text.primary',
                border: activeTab === tab ? 'none' : '1px solid #E0E0E0',
                '&:hover': { bgcolor: activeTab === tab ? '#166fe5' : '#F0F2F5' },
                '& .MuiChip-label': { px: 1.5 },
              }} />
          ))}
        </Box>


        {loading ? (
          <><PostSkeleton /><PostSkeleton /><PostSkeleton /></>
        ) : displayPosts.length === 0 ? (
          <Box sx={{
            textAlign: 'center', py: 8, bgcolor: '#fff', borderRadius: '16px',
            border: '2px dashed #E0E0E0'
          }}>
            <Typography fontSize="2.8rem">📭</Typography>
            <Typography fontWeight={600} color="text.secondary" mt={1}>No posts yet</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>Be the first to make a wave!</Typography>
            <Button variant="contained" onClick={() => setDrawerOpen(true)} sx={{ borderRadius: 20 }}>
              Create Post
            </Button>
          </Box>
        ) : (
          <>
            {displayPosts.map((p) => (
              <PostCard key={p._id} post={p} currentUser={user}
                onDelete={(id) => setPosts((prev) => prev.filter((x) => x._id !== id))} />
            ))}
            {page < totalPages && (
              <Box textAlign="center" mt={1} mb={2}>
                <Button variant="outlined" onClick={() => fetchPosts(page + 1, false)}
                  disabled={loadingMore}
                  startIcon={loadingMore && <CircularProgress size={16} />}
                  sx={{
                    borderRadius: 20, borderColor: '#E0E0E0', color: 'text.secondary',
                    '&:hover': { borderColor: '#1877F2', color: '#1877F2' }
                  }}>
                  {loadingMore ? 'Loading…' : 'Load more posts'}
                </Button>
              </Box>
            )}
            {page >= totalPages && posts.length > 5 && (
              <Typography variant="caption" color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
                ✅ You've seen all posts
              </Typography>
            )}
          </>
        )}
      </Box>


      <Fab color="primary" onClick={() => setDrawerOpen(true)}
        sx={{
          position: 'fixed', bottom: 76, right: 20,
          boxShadow: '0 4px 18px rgba(24,119,242,0.45)',
          display: { sm: 'none' }
        }}>
        <AddIcon />
      </Fab>


      <Box sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        bgcolor: '#1877F2', display: 'flex', alignItems: 'center',
        justifyContent: 'space-around', px: 1, pt: 0.8, pb: 1.2,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.18)',
      }}>
        {[
          { icon: <HomeOutlinedIcon />, label: 'Home', active: false },
          { icon: <AssignmentOutlinedIcon />, label: 'Tasks', active: false },
          { icon: <LanguageIcon />, label: 'Social', active: true },
          { icon: <EmojiEventsOutlinedIcon />, label: 'Rank', active: false },
        ].map((item) => (
          <Box key={item.label}
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              cursor: 'pointer', px: 1.5, py: 0.4, borderRadius: 2,
              bgcolor: item.active ? 'rgba(255,255,255,0.18)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' }
            }}>
            <Box sx={{ color: item.active ? '#fff' : 'rgba(255,255,255,0.72)', fontSize: 22 }}>
              {item.icon}
            </Box>
            <Typography fontSize="0.67rem" fontWeight={item.active ? 700 : 400}
              color={item.active ? '#fff' : 'rgba(255,255,255,0.72)'}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>


      <CreatePostDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={(post) => setPosts((p) => [post, ...p])}
        user={user}
      />
    </Box>
  )
}
