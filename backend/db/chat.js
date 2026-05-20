const supabase = require('./supabase');

async function upsertChatProfile(userId, username, avatarUrl) {
  try {
    const { data, error } = await supabase
      .from('chat_profiles')
      .upsert(
        { user_id: userId, username, avatar_url: avatarUrl },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function searchUsers(query, currentUserId, limit = 20) {
  try {
    // 1. First find user_ids matching the query in the users table (sport/team)
    const { data: matchedUsers } = await supabase
      .from('users')
      .select('id')
      .ilike('country', `%${query}%`);
      
    const extraIds = matchedUsers ? matchedUsers.map(u => u.id) : [];

    // 2. Query chat_profiles matching username OR matching extraIds
    let queryBuilder = supabase
      .from('chat_profiles')
      .select('*')
      .neq('user_id', currentUserId)
      .limit(limit);
      
    if (extraIds.length > 0) {
      queryBuilder = queryBuilder.or(`username.ilike.%${query}%,user_id.in.(${extraIds.join(',')})`);
    } else {
      queryBuilder = queryBuilder.ilike('username', `%${query}%`);
    }

    const { data: users, error: usersError } = await queryBuilder;

    if (usersError) throw usersError;

    const { data: requests, error: requestsError } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

    if (requestsError) throw requestsError;

    let usersWithStatus = users.map(user => {
      const request = requests.find(req => req.sender_id === user.user_id || req.receiver_id === user.user_id);
      let status = 'none';
      if (request) {
        if (request.status === 'accepted') status = 'accepted';
        else if (request.sender_id === currentUserId) status = 'pending_sent';
        else if (request.receiver_id === currentUserId) status = 'pending_received';
      }
      return { ...user, friendship_status: status };
    });

    if (usersWithStatus.length > 0) {
      const { data: usersData } = await supabase.from('users').select('id, country').in('id', usersWithStatus.map(u => u.user_id));
      if (usersData) {
        usersWithStatus = usersWithStatus.map(u => {
          const ud = usersData.find(x => x.id === u.user_id);
          if (ud && ud.country && ud.country !== 'GLOBAL') {
            try {
              const prefs = JSON.parse(ud.country);
              return { ...u, sport: prefs.sport, team: prefs.team };
            } catch (e) {}
          }
          return u;
        });
      }
    }

    return { data: usersWithStatus, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function getSuggestedUsers(currentUserId, limit = 10) {
  try {
    // 1. Get all requests involving current user
    const { data: requests, error: requestsError } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

    if (requestsError) throw requestsError;

    // Build an array of IDs to exclude (already friends or pending, and self)
    const excludeIds = [currentUserId];
    if (requests) {
      requests.forEach(req => {
        excludeIds.push(req.sender_id === currentUserId ? req.receiver_id : req.sender_id);
      });
    }

    // 2. Query chat profiles not in excludeIds, order by recently active or random
    // Note: since supabase RPC for random might not exist, we just order by last_seen
    const { data: suggested, error: suggestedError } = await supabase
      .from('chat_profiles')
      .select('*')
      .not('user_id', 'in', `(${excludeIds.join(',')})`)
      .order('last_seen', { ascending: false })
      .limit(limit);

    if (suggestedError) throw suggestedError;

    let usersWithStatus = suggested.map(user => ({
      ...user,
      friendship_status: 'none'
    }));

    if (usersWithStatus.length > 0) {
      const { data: usersData } = await supabase.from('users').select('id, country').in('id', usersWithStatus.map(u => u.user_id));
      if (usersData) {
        usersWithStatus = usersWithStatus.map(u => {
          const ud = usersData.find(x => x.id === u.user_id);
          if (ud && ud.country && ud.country !== 'GLOBAL') {
            try {
              const prefs = JSON.parse(ud.country);
              return { ...u, sport: prefs.sport, team: prefs.team };
            } catch (e) {}
          }
          return u;
        });
      }
    }

    return { data: usersWithStatus, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function getFriends(userId) {
  try {
    const { data: requests, error: requestsError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (requestsError) throw requestsError;

    if (!requests || requests.length === 0) return { data: [], error: null };

    const friendIds = requests.map(req => req.sender_id === userId ? req.receiver_id : req.sender_id);

    const { data: profiles, error: profilesError } = await supabase
      .from('chat_profiles')
      .select('*')
      .in('user_id', friendIds);

    if (profilesError) throw profilesError;

    const friendsData = await Promise.all(profiles.map(async (profile) => {
      const conversationId = [userId, profile.user_id].sort().join('_');
      
      const { data: lastMessageData, error: lastMsgError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1);

      const lastMessage = (lastMessageData && lastMessageData.length > 0) ? lastMessageData[0] : null;

      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('is_read', false);

      return {
        profile,
        lastMessage,
        unreadCount: count || 0
      };
    }));

    return { data: friendsData, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function getPendingRequests(userId) {
  try {
    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    if (error) throw error;

    if (!requests || requests.length === 0) return { data: [], error: null };

    const senderIds = requests.map(req => req.sender_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('chat_profiles')
      .select('*')
      .in('user_id', senderIds);

    if (profilesError) throw profilesError;

    const pendingRequests = requests.map(req => ({
      requestId: req.id,
      sender: profiles.find(p => p.user_id === req.sender_id) || { user_id: req.sender_id, username: 'Unknown' },
      created_at: req.created_at
    }));

    return { data: pendingRequests, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function sendFriendRequest(senderId, receiverId) {
  try {
    const { data: existing, error: existingError } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      if (existing.status === 'accepted') return { data: null, error: 'Already friends' };
      if (existing.status === 'pending') return { data: null, error: 'Request already sent or pending' };
    }

    const { data, error } = await supabase
      .from('friend_requests')
      .insert({ sender_id: senderId, receiver_id: receiverId, status: 'pending' })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function updateRequestStatus(requestId, status, currentUserId) {
  try {
    const { data: request, error: fetchError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;
    if (!request) return { data: null, error: 'Request not found' };
    if (request.receiver_id !== currentUserId) return { data: null, error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('friend_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function sendMessage(conversationId, senderId, receiverId, content) {
  try {
    if (!content || content.length === 0 || content.length > 2000) {
      return { data: null, error: 'Invalid content length' };
    }

    const { data: isFriend, error: friendError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('status', 'accepted')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .maybeSingle();

    if (friendError) throw friendError;
    if (!isFriend) return { data: null, error: 'Must be friends to send messages' };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function getMessages(conversationId, currentUserId, limit = 50, offset = 0) {
  try {
    if (!conversationId.includes(currentUserId)) {
      return { data: null, error: 'Unauthorized' };
    }

    const { data, error, count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { 
      data: {
        messages: data.reverse(), // reverse to ASC order
        total: count,
        hasMore: offset + data.length < count
      }, 
      error: null 
    };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function markMessagesRead(conversationId, receiverId) {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', receiverId)
      .eq('is_read', false);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function getTotalUnreadCount(userId) {
  try {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { data: { count: count || 0 }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function setOnlineStatus(userId, isOnline) {
  try {
    const { error } = await supabase
      .from('chat_profiles')
      .update({ is_online: isOnline, last_seen: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

module.exports = {
  upsertChatProfile,
  searchUsers,
  getSuggestedUsers,
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  updateRequestStatus,
  sendMessage,
  getMessages,
  markMessagesRead,
  getTotalUnreadCount,
  setOnlineStatus
};
