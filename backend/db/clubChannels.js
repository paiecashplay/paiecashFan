const supabase = require('./supabase');

/**
 * Fetch messages for a specific club channel
 * Uses cursor-based pagination (or standard limit/offset)
 */
async function getClubMessages(clubId, limit = 100) {
  try {
    const { data, error } = await supabase
      .from('club_messages')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    // Return in ascending order for UI display
    return { data: data.reverse(), error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Insert a new message into a club channel
 */
async function insertClubMessage({ clubId, userId, username, avatarColor, message, messageType = 'text', metadata = null }) {
  try {
    const { data, error } = await supabase
      .from('club_messages')
      .insert({
        club_id: clubId,
        user_id: userId,
        username,
        avatar_color: avatarColor,
        message,
        message_type: messageType,
        metadata,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Pin or unpin a message
 */
async function pinClubMessage(messageId, isPinned) {
  try {
    const { data, error } = await supabase
      .from('club_messages')
      .update({ is_pinned: isPinned })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

module.exports = {
  getClubMessages,
  insertClubMessage,
  pinClubMessage,
};
