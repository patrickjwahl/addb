import axios from 'axios';

class API {
    constructor() {
        this.axios = axios.create({
            baseURL: '/api'
        });
    }

    logIn = (username, password) => {
        return this.axios
            .post('/login', {
                username: username,
                password: password
            })
            .then(res => {
                if (!res.data.success) {
                    this.logOut();
                    return res.data;
                }
                localStorage.setItem('expiresAt', res.data.expiresIn + new Date().getTime());
                localStorage.setItem('canEdit', res.data.canEdit.toString());
                localStorage.setItem('access', res.data.access);
                localStorage.setItem('username', res.data.username);
                return res.data;
            })
            .catch(err => {
                this.logOut();
                console.log(err);
                return {success: false, message: "There was an error."};
            });
    };

    createUser = data => {
        return this.axios
            .post('/user', data)
            .then(res => {
                return res;
            })
            .catch(err => {
                console.log(err);
                return {success: false, message: "There was an error."};
            });
    };

    logOut = () => {
        localStorage.removeItem('expiresAt');
        localStorage.removeItem('access');
        localStorage.removeItem('canEdit');
        localStorage.removeItem('username');
        this.axios.get('/logout');
    };

    accessLevel = () => {
        if (this.isLoggedIn()) {
            let level = localStorage.getItem('access');
            if (level) return parseInt(level);
        }
        return 1;
    };

    username = () => {
        if (this.isLoggedIn()) {
            let uname = localStorage.getItem('username');
            if (uname) return uname;
        }
        return '???';
    }

    authenticate = () => {
        return this.axios.get('/authenticate')
            .then(res => {
                if (!res.data.success) {
                    this.logOut();
                }
            })
            .catch(err => {
                console.log(err);
                this.logOut();
            });
    }

    isLoggedIn = () => {
        let expiresAt = localStorage.getItem('expiresAt');
        if (new Date().getTime() < expiresAt) {
            return true;
        }
        this.logOut();
        return false;
    };

    canEdit = () => {
        let canEdit = localStorage.getItem('canEdit');
        if (canEdit === 'true') {
            return true;
        }
        return false;
    };

    quickSearch = query => {
        return this.axios.get(`/search?query=${query}&limit=3`);
    };

    search = query => {
        return this.axios.get(`/search?query=${query}`);
    }

    createMatch = formData => {
        return this.axios.post('/matchcreate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data; charset=utf-8'
            }
        });
    };

    submitMatch = (studentData, teamData, matchData) => {
        let x = this.axios.post('/match', {
            studentData,
            teamData,
            matchData
        });
        return x;
    };

    createSchool = schoolData => {
        return this.axios.post('/school', {
            school: schoolData
        });
    };

    getSchool = id => {
        return this.axios.get(`/school/${id}`);
    };

    getPerson = id => {
        return this.axios.get(`/person/${id}`);
    }

    mergePeople = (godId, peonId) => {
        return this.axios.post(`/mergepeople/${godId}/${peonId}`);
    };

    updateSchool = (id, edits) => {
        return this.axios.post(`/school/${id}`, {
            edits: edits
        })
        .then(res => {
            return res;
        });
    };

    getEdits = lastDate => {
        return this.axios.post('/edits', {
            date: lastDate
        });
    };

    getMatch = id => {
        let endpoint = `/match/${id}`;
        return this.axios.get(endpoint);
    };

    getMatchSpecific = (round, region, state, year) => {
        return this.axios.get(`/match/${round}/${state ? state + '/': ''}${region ? region + '/' : ''}${year}`);
    };

    getRecentMatches = () => {
        return this.axios.get('/recent');
    };

    getStateResults = (state) => {
        return this.axios.get(`/state/${state}`);
    }

    updatePerson = (id, edits) => {
        return this.axios.post(`/person/${id}`, {
            edits: edits
        })
        .then(res => {
            return res;
        });
    };

    updateMatchStudent = (id, studentIndex, edits) => {
        return this.axios.post(`/matchstudent/${id}`, {
            index: studentIndex,
            edits: edits
        })
        .then(res => {
            return res;
        });
    };

    updateMatchTeam = (id, teamIndex, edits) => {
        return this.axios.post(`/matchteam/${id}`, {
            index: teamIndex,
            edits: edits
        })
        .then(res => {
            return res;
        });
    };

    deleteMatch = id => {
        return this.axios.delete(`/match/${id}`);
    };

    deletePerson = id => {
        return this.axios.delete(`/person/${id}`);
    };

    getRoster = (schoolId, year) => {
        return this.axios.get(`/roster/${schoolId}/${year}`);
    };

    getSeason = (schoolId, year) => {
        return this.axios.get(`/season/${schoolId}/${year}`);
    };

    getPotentialMerges = (state) => {
        return this.axios.get(`/potentialmerges/${state}`);
    };
}

const api = new API();
export default api;