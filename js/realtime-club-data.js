// Realtime Club Data V6.0
class RealtimeClubData {
    constructor() {
        this.listeners = [];
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    async getRealtimeData(clubId) {
        return {
            clubId: clubId,
            live: {
                score: '2 - 1',
                minute: 67,
                attendance: 42567,
                trending: '#AlleOM'
            },
            social: {
                tweets: 15420,
                mentions: 8900,
                sentiment: 'positive'
            },
            lastUpdate: new Date().toISOString()
        };
    }

    notifyListeners(data) {
        this.listeners.forEach(callback => callback(data));
    }
}

window.realtimeClubData = new RealtimeClubData();
console.log('✅ Realtime Club Data V6.0 chargé');
