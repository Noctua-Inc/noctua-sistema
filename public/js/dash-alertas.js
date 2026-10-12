const DADOS_DASHBOARD = {
    atualizadoEm: "2026-10-10T14:00:00-03:00",
    fusoHorario: "America/Sao_Paulo",
    localizacoes: ["São Paulo", "Rio de Janeiro", "Curitiba"],
    mainframes: [
        {"hostname":"MF-SP-01","localizacao":"São Paulo"},
        {"hostname":"MF-SP-02","localizacao":"São Paulo"},
        {"hostname":"MF-SP-03","localizacao":"São Paulo"},
        {"hostname":"MF-SP-04","localizacao":"São Paulo"},
        {"hostname":"MF-SP-05","localizacao":"São Paulo"},
        {"hostname":"MF-SP-06","localizacao":"São Paulo"},
        {"hostname":"MF-SP-07","localizacao":"São Paulo"},
        {"hostname":"MF-SP-08","localizacao":"São Paulo"},
        {"hostname":"MF-SP-09","localizacao":"São Paulo"},
        {"hostname":"MF-SP-10","localizacao":"São Paulo"},
        {"hostname":"MF-SP-11","localizacao":"São Paulo"},
        {"hostname":"MF-SP-12","localizacao":"São Paulo"},
        {"hostname":"MF-RJ-01","localizacao":"Rio de Janeiro"},
        {"hostname":"MF-RJ-02","localizacao":"Rio de Janeiro"},
        {"hostname":"MF-RJ-03","localizacao":"Rio de Janeiro"},
        {"hostname":"MF-RJ-04","localizacao":"Rio de Janeiro"},
        {"hostname":"MF-RJ-05","localizacao":"Rio de Janeiro"},
        {"hostname":"MF-RJ-06","localizacao":"Rio de Janeiro"},
        {"hostname":"MF-RJ-07","localizacao":"Rio de Janeiro"},
        {"hostname":"MF-RJ-08","localizacao":"Rio de Janeiro"},
        {"hostname":"MF-CTB-01","localizacao":"Curitiba"},
        {"hostname":"MF-CTB-02","localizacao":"Curitiba"},
        {"hostname":"MF-CTB-03","localizacao":"Curitiba"},
        {"hostname":"MF-CTB-04","localizacao":"Curitiba"},
    ],

    alertas: [
        {"id":"ALT-244","mainframe":"MF-SP-01","componente":"RAM","severidade":"critica","status":"aberto","inicio":"2026-10-10T13:42:00-03:00","resolvidoEm":null,"reincidente":false},
        {"id":"ALT-242","mainframe":"MF-SP-02","componente":"CPU","severidade":"critica","status":"investigacao","inicio":"2026-10-10T13:35:00-03:00","resolvidoEm":null,"reincidente":false},
        {"id":"ALT-240","mainframe":"MF-RJ-01","componente":"DISCO","severidade":"critica","status":"aberto","inicio":"2026-10-10T13:20:00-03:00","resolvidoEm":null,"reincidente":false},
        {"id":"ALT-245","mainframe":"MF-SP-01","componente":"CPU","severidade":"alta","status":"aberto","inicio":"2026-10-10T13:48:00-03:00","resolvidoEm":null,"reincidente":false},
        {"id":"ALT-243","mainframe":"MF-SP-02","componente":"RAM","severidade":"alta","status":"investigacao","inicio":"2026-10-10T13:40:00-03:00","resolvidoEm":null,"reincidente":false},
        {"id":"ALT-241","mainframe":"MF-RJ-01","componente":"RAM","severidade":"alta","status":"aberto","inicio":"2026-10-10T13:25:00-03:00","resolvidoEm":null,"reincidente":false},
        {"id":"ALT-239","mainframe":"MF-SP-03","componente":"CPU","severidade":"alta","status":"investigacao","inicio":"2026-10-10T13:10:00-03:00","resolvidoEm":null,"reincidente":false},
        {"id":"ALT-238","mainframe":"MF-SP-03","componente":"RAM","severidade":"alta","status":"investigacao","inicio":"2026-10-10T12:50:00-03:00","resolvidoEm":null,"reincidente":false},
        {"id":"ALT-248","mainframe":"MF-SP-02","componente":"DISCO","severidade":"moderada","status":"aberto","inicio":"2026-10-10T13:55:00-03:00","resolvidoEm":null,"reincidente":false},
        {"id":"ALT-247","mainframe":"MF-SP-01","componente":"SWAP","severidade":"moderada","status":"aberto","inicio":"2026-10-10T13:52:00-03:00","resolvidoEm":null,"reincidente":false},
        {"id":"ALT-246","mainframe":"MF-SP-01","componente":"DISCO","severidade":"moderada","status":"aberto","inicio":"2026-10-10T13:50:00-03:00","resolvidoEm":null,"reincidente":false},
        {"id":"ALT-237","mainframe":"MF-RJ-02","componente":"RAM","severidade":"moderada","status":"aberto","inicio":"2026-10-10T12:40:00-03:00","resolvidoEm":null,"reincidente":false},
        {"id":"ALT-234","mainframe":"MF-CTB-04","componente":"RAM","severidade":"critica","status":"resolvido","inicio":"2026-10-10T09:35:00-03:00","resolvidoEm":"2026-10-10T09:53:00-03:00","reincidente":true},
        {"id":"ALT-231","mainframe":"MF-SP-10","componente":"RAM","severidade":"critica","status":"resolvido","inicio":"2026-10-10T08:41:49.090909-03:00","resolvidoEm":"2026-10-10T08:59:49.090909-03:00","reincidente":true},
        {"id":"ALT-228","mainframe":"MF-RJ-07","componente":"RAM","severidade":"critica","status":"resolvido","inicio":"2026-10-10T07:48:38.181818-03:00","resolvidoEm":"2026-10-10T08:06:38.181818-03:00","reincidente":false},
        {"id":"ALT-225","mainframe":"MF-RJ-02","componente":"DISCO","severidade":"critica","status":"resolvido","inicio":"2026-10-10T06:55:27.272727-03:00","resolvidoEm":"2026-10-10T07:13:27.272727-03:00","reincidente":false},
        {"id":"ALT-222","mainframe":"MF-CTB-01","componente":"RAM","severidade":"critica","status":"resolvido","inicio":"2026-10-10T05:35:00-03:00","resolvidoEm":"2026-10-10T05:53:00-03:00","reincidente":false},
        {"id":"ALT-219","mainframe":"MF-SP-09","componente":"DISCO","severidade":"critica","status":"resolvido","inicio":"2026-10-10T05:04:12.631579-03:00","resolvidoEm":"2026-10-10T05:22:12.631579-03:00","reincidente":false},
        {"id":"ALT-216","mainframe":"MF-SP-02","componente":"SWAP","severidade":"critica","status":"resolvido","inicio":"2026-10-10T04:33:25.263158-03:00","resolvidoEm":"2026-10-10T04:51:25.263158-03:00","reincidente":false},
        {"id":"ALT-213","mainframe":"MF-RJ-03","componente":"CPU","severidade":"critica","status":"resolvido","inicio":"2026-10-10T04:02:37.894737-03:00","resolvidoEm":"2026-10-10T04:20:37.894737-03:00","reincidente":false},
        {"id":"ALT-210","mainframe":"MF-SP-10","componente":"CPU","severidade":"critica","status":"resolvido","inicio":"2026-10-10T03:31:50.526316-03:00","resolvidoEm":"2026-10-10T03:49:50.526316-03:00","reincidente":false},
        {"id":"ALT-207","mainframe":"MF-RJ-08","componente":"RAM","severidade":"critica","status":"resolvido","inicio":"2026-10-10T03:01:03.157895-03:00","resolvidoEm":"2026-10-10T03:19:03.157895-03:00","reincidente":false},
        {"id":"ALT-204","mainframe":"MF-RJ-05","componente":"RAM","severidade":"critica","status":"resolvido","inicio":"2026-10-10T02:30:15.789474-03:00","resolvidoEm":"2026-10-10T02:48:15.789474-03:00","reincidente":false},
        {"id":"ALT-201","mainframe":"MF-SP-06","componente":"DISCO","severidade":"critica","status":"resolvido","inicio":"2026-10-10T01:17:16.363636-03:00","resolvidoEm":"2026-10-10T01:35:16.363636-03:00","reincidente":false},
        {"id":"ALT-198","mainframe":"MF-RJ-08","componente":"CPU","severidade":"critica","status":"resolvido","inicio":"2026-10-10T00:24:05.454545-03:00","resolvidoEm":"2026-10-10T00:42:05.454545-03:00","reincidente":false},
        {"id":"ALT-195","mainframe":"MF-CTB-04","componente":"RAM","severidade":"critica","status":"resolvido","inicio":"2026-10-09T23:30:54.545455-03:00","resolvidoEm":"2026-10-09T23:48:54.545455-03:00","reincidente":false},
        {"id":"ALT-192","mainframe":"MF-SP-07","componente":"DISCO","severidade":"critica","status":"resolvido","inicio":"2026-10-09T22:37:43.636364-03:00","resolvidoEm":"2026-10-09T22:55:43.636364-03:00","reincidente":false},
        {"id":"ALT-189","mainframe":"MF-RJ-02","componente":"CPU","severidade":"critica","status":"resolvido","inicio":"2026-10-09T21:10:37.500000-03:00","resolvidoEm":"2026-10-09T21:28:37.500000-03:00","reincidente":false},
        {"id":"ALT-186","mainframe":"MF-SP-05","componente":"DISCO","severidade":"critica","status":"resolvido","inicio":"2026-10-09T19:57:30-03:00","resolvidoEm":"2026-10-09T20:15:30-03:00","reincidente":false},
        {"id":"ALT-183","mainframe":"MF-SP-04","componente":"DISCO","severidade":"critica","status":"resolvido","inicio":"2026-10-09T18:44:22.500000-03:00","resolvidoEm":"2026-10-09T19:02:22.500000-03:00","reincidente":false},
        {"id":"ALT-180","mainframe":"MF-SP-04","componente":"SWAP","severidade":"critica","status":"resolvido","inicio":"2026-10-09T17:02:30-03:00","resolvidoEm":"2026-10-09T17:20:30-03:00","reincidente":false},
        {"id":"ALT-177","mainframe":"MF-SP-08","componente":"RAM","severidade":"critica","status":"resolvido","inicio":"2026-10-09T15:25:00-03:00","resolvidoEm":"2026-10-09T15:43:00-03:00","reincidente":false},
        {"id":"ALT-102","mainframe":"MF-SP-09","componente":"DISCO","severidade":"critica","status":"resolvido","inicio":"2026-10-08T09:40:00-03:00","resolvidoEm":"2026-10-08T10:00:00-03:00","reincidente":false},
        {"id":"ALT-106","mainframe":"MF-SP-12","componente":"DISCO","severidade":"critica","status":"resolvido","inicio":"2026-10-07T09:40:00-03:00","resolvidoEm":"2026-10-07T10:00:00-03:00","reincidente":false},
        {"id":"ALT-110","mainframe":"MF-RJ-03","componente":"DISCO","severidade":"critica","status":"resolvido","inicio":"2026-10-06T09:40:00-03:00","resolvidoEm":"2026-10-06T10:00:00-03:00","reincidente":false},
        {"id":"ALT-114","mainframe":"MF-RJ-06","componente":"DISCO","severidade":"critica","status":"resolvido","inicio":"2026-10-05T09:40:00-03:00","resolvidoEm":"2026-10-05T10:00:00-03:00","reincidente":false},
        {"id":"ALT-118","mainframe":"MF-CTB-01","componente":"DISCO","severidade":"critica","status":"resolvido","inicio":"2026-10-04T09:40:00-03:00","resolvidoEm":"2026-10-04T10:00:00-03:00","reincidente":false},
        {"id":"ALT-235","mainframe":"MF-RJ-01","componente":"CPU","severidade":"alta","status":"resolvido","inicio":"2026-10-10T12:10:00-03:00","resolvidoEm":"2026-10-10T12:32:00-03:00","reincidente":false},
        {"id":"ALT-233","mainframe":"MF-RJ-06","componente":"RAM","severidade":"alta","status":"resolvido","inicio":"2026-10-10T09:17:16.363636-03:00","resolvidoEm":"2026-10-10T09:35:16.363636-03:00","reincidente":true},
        {"id":"ALT-230","mainframe":"MF-SP-12","componente":"RAM","severidade":"alta","status":"resolvido","inicio":"2026-10-10T08:24:05.454545-03:00","resolvidoEm":"2026-10-10T08:42:05.454545-03:00","reincidente":true},
        {"id":"ALT-227","mainframe":"MF-SP-04","componente":"RAM","severidade":"alta","status":"resolvido","inicio":"2026-10-10T07:30:54.545455-03:00","resolvidoEm":"2026-10-10T07:48:54.545455-03:00","reincidente":false},
        {"id":"ALT-224","mainframe":"MF-SP-06","componente":"RAM","severidade":"alta","status":"resolvido","inicio":"2026-10-10T06:37:43.636364-03:00","resolvidoEm":"2026-10-10T06:55:43.636364-03:00","reincidente":false},
        {"id":"ALT-221","mainframe":"MF-SP-05","componente":"RAM","severidade":"alta","status":"resolvido","inicio":"2026-10-10T05:24:44.210526-03:00","resolvidoEm":"2026-10-10T05:42:44.210526-03:00","reincidente":false},
        {"id":"ALT-218","mainframe":"MF-RJ-03","componente":"RAM","severidade":"alta","status":"resolvido","inicio":"2026-10-10T04:53:56.842105-03:00","resolvidoEm":"2026-10-10T05:11:56.842105-03:00","reincidente":false},
        {"id":"ALT-215","mainframe":"MF-SP-11","componente":"RAM","severidade":"alta","status":"resolvido","inicio":"2026-10-10T04:23:09.473684-03:00","resolvidoEm":"2026-10-10T04:41:09.473684-03:00","reincidente":false},
        {"id":"ALT-212","mainframe":"MF-SP-07","componente":"CPU","severidade":"alta","status":"resolvido","inicio":"2026-10-10T03:52:22.105263-03:00","resolvidoEm":"2026-10-10T04:10:22.105263-03:00","reincidente":false},
        {"id":"ALT-209","mainframe":"MF-CTB-02","componente":"RAM","severidade":"alta","status":"resolvido","inicio":"2026-10-10T03:21:34.736842-03:00","resolvidoEm":"2026-10-10T03:39:34.736842-03:00","reincidente":false},
        {"id":"ALT-206","mainframe":"MF-SP-05","componente":"SWAP","severidade":"alta","status":"resolvido","inicio":"2026-10-10T02:50:47.368421-03:00","resolvidoEm":"2026-10-10T03:08:47.368421-03:00","reincidente":false},
        {"id":"ALT-203","mainframe":"MF-CTB-01","componente":"CPU","severidade":"alta","status":"resolvido","inicio":"2026-10-10T02:20:00-03:00","resolvidoEm":"2026-10-10T02:38:00-03:00","reincidente":false},
        {"id":"ALT-200","mainframe":"MF-SP-10","componente":"DISCO","severidade":"alta","status":"resolvido","inicio":"2026-10-10T00:59:32.727273-03:00","resolvidoEm":"2026-10-10T01:17:32.727273-03:00","reincidente":false},
        {"id":"ALT-197","mainframe":"MF-RJ-05","componente":"CPU","severidade":"alta","status":"resolvido","inicio":"2026-10-10T00:06:21.818182-03:00","resolvidoEm":"2026-10-10T00:24:21.818182-03:00","reincidente":false},
        {"id":"ALT-194","mainframe":"MF-RJ-06","componente":"CPU","severidade":"alta","status":"resolvido","inicio":"2026-10-09T23:13:10.909091-03:00","resolvidoEm":"2026-10-09T23:31:10.909091-03:00","reincidente":false},
        {"id":"ALT-191","mainframe":"MF-RJ-04","componente":"DISCO","severidade":"alta","status":"resolvido","inicio":"2026-10-09T22:20:00-03:00","resolvidoEm":"2026-10-09T22:38:00-03:00","reincidente":false},
        {"id":"ALT-188","mainframe":"MF-RJ-06","componente":"RAM","severidade":"alta","status":"resolvido","inicio":"2026-10-09T20:46:15-03:00","resolvidoEm":"2026-10-09T21:04:15-03:00","reincidente":false},
        {"id":"ALT-185","mainframe":"MF-CTB-02","componente":"CPU","severidade":"alta","status":"resolvido","inicio":"2026-10-09T19:33:07.500000-03:00","resolvidoEm":"2026-10-09T19:51:07.500000-03:00","reincidente":false},
        {"id":"ALT-182","mainframe":"MF-SP-10","componente":"RAM","severidade":"alta","status":"resolvido","inicio":"2026-10-09T18:20:00-03:00","resolvidoEm":"2026-10-09T18:38:00-03:00","reincidente":false},
        {"id":"ALT-179","mainframe":"MF-SP-11","componente":"DISCO","severidade":"alta","status":"resolvido","inicio":"2026-10-09T16:30:00-03:00","resolvidoEm":"2026-10-09T16:48:00-03:00","reincidente":false},
        {"id":"ALT-176","mainframe":"MF-SP-09","componente":"CPU","severidade":"alta","status":"resolvido","inicio":"2026-10-09T14:52:30-03:00","resolvidoEm":"2026-10-09T15:10:30-03:00","reincidente":false},
        {"id":"ALT-101","mainframe":"MF-SP-08","componente":"CPU","severidade":"alta","status":"resolvido","inicio":"2026-10-08T11:50:00-03:00","resolvidoEm":"2026-10-08T12:06:00-03:00","reincidente":false},
        {"id":"ALT-103","mainframe":"MF-SP-10","componente":"SWAP","severidade":"alta","status":"resolvido","inicio":"2026-10-08T07:30:00-03:00","resolvidoEm":"2026-10-08T07:54:00-03:00","reincidente":false},
        {"id":"ALT-105","mainframe":"MF-SP-11","componente":"CPU","severidade":"alta","status":"resolvido","inicio":"2026-10-07T11:50:00-03:00","resolvidoEm":"2026-10-07T12:06:00-03:00","reincidente":false},
        {"id":"ALT-107","mainframe":"MF-RJ-01","componente":"SWAP","severidade":"alta","status":"resolvido","inicio":"2026-10-07T07:30:00-03:00","resolvidoEm":"2026-10-07T07:54:00-03:00","reincidente":false},
        {"id":"ALT-109","mainframe":"MF-RJ-02","componente":"CPU","severidade":"alta","status":"resolvido","inicio":"2026-10-06T11:50:00-03:00","resolvidoEm":"2026-10-06T12:06:00-03:00","reincidente":false},
        {"id":"ALT-111","mainframe":"MF-RJ-04","componente":"SWAP","severidade":"alta","status":"resolvido","inicio":"2026-10-06T07:30:00-03:00","resolvidoEm":"2026-10-06T07:54:00-03:00","reincidente":false},
        {"id":"ALT-113","mainframe":"MF-RJ-05","componente":"CPU","severidade":"alta","status":"resolvido","inicio":"2026-10-05T11:50:00-03:00","resolvidoEm":"2026-10-05T12:06:00-03:00","reincidente":false},
        {"id":"ALT-115","mainframe":"MF-RJ-07","componente":"SWAP","severidade":"alta","status":"resolvido","inicio":"2026-10-05T07:30:00-03:00","resolvidoEm":"2026-10-05T07:54:00-03:00","reincidente":false},
        {"id":"ALT-117","mainframe":"MF-RJ-08","componente":"CPU","severidade":"alta","status":"resolvido","inicio":"2026-10-04T11:50:00-03:00","resolvidoEm":"2026-10-04T12:06:00-03:00","reincidente":false},
        {"id":"ALT-119","mainframe":"MF-CTB-02","componente":"SWAP","severidade":"alta","status":"resolvido","inicio":"2026-10-04T07:30:00-03:00","resolvidoEm":"2026-10-04T07:54:00-03:00","reincidente":false},
        {"id":"ALT-236","mainframe":"MF-RJ-02","componente":"SWAP","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T12:40:00-03:00","resolvidoEm":"2026-10-10T12:54:00-03:00","reincidente":false},
        {"id":"ALT-232","mainframe":"MF-SP-09","componente":"RAM","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T08:59:32.727273-03:00","resolvidoEm":"2026-10-10T09:17:32.727273-03:00","reincidente":true},
        {"id":"ALT-229","mainframe":"MF-SP-08","componente":"RAM","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T08:06:21.818182-03:00","resolvidoEm":"2026-10-10T08:24:21.818182-03:00","reincidente":true},
        {"id":"ALT-226","mainframe":"MF-RJ-07","componente":"CPU","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T07:13:10.909091-03:00","resolvidoEm":"2026-10-10T07:31:10.909091-03:00","reincidente":false},
        {"id":"ALT-223","mainframe":"MF-RJ-04","componente":"RAM","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T06:20:00-03:00","resolvidoEm":"2026-10-10T06:38:00-03:00","reincidente":false},
        {"id":"ALT-220","mainframe":"MF-SP-07","componente":"RAM","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T05:14:28.421053-03:00","resolvidoEm":"2026-10-10T05:32:28.421053-03:00","reincidente":false},
        {"id":"ALT-217","mainframe":"MF-SP-08","componente":"CPU","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T04:43:41.052632-03:00","resolvidoEm":"2026-10-10T05:01:41.052632-03:00","reincidente":false},
        {"id":"ALT-214","mainframe":"MF-SP-06","componente":"CPU","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T04:12:53.684211-03:00","resolvidoEm":"2026-10-10T04:30:53.684211-03:00","reincidente":false},
        {"id":"ALT-211","mainframe":"MF-CTB-03","componente":"RAM","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T03:42:06.315789-03:00","resolvidoEm":"2026-10-10T04:00:06.315789-03:00","reincidente":false},
        {"id":"ALT-208","mainframe":"MF-SP-03","componente":"DISCO","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T03:11:18.947368-03:00","resolvidoEm":"2026-10-10T03:29:18.947368-03:00","reincidente":false},
        {"id":"ALT-205","mainframe":"MF-SP-12","componente":"CPU","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T02:40:31.578947-03:00","resolvidoEm":"2026-10-10T02:58:31.578947-03:00","reincidente":false},
        {"id":"ALT-202","mainframe":"MF-RJ-03","componente":"DISCO","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T01:35:00-03:00","resolvidoEm":"2026-10-10T01:53:00-03:00","reincidente":false},
        {"id":"ALT-199","mainframe":"MF-SP-08","componente":"DISCO","severidade":"moderada","status":"resolvido","inicio":"2026-10-10T00:41:49.090909-03:00","resolvidoEm":"2026-10-10T00:59:49.090909-03:00","reincidente":false},
        {"id":"ALT-196","mainframe":"MF-SP-11","componente":"CPU","severidade":"moderada","status":"resolvido","inicio":"2026-10-09T23:48:38.181818-03:00","resolvidoEm":"2026-10-10T00:06:38.181818-03:00","reincidente":false},
        {"id":"ALT-193","mainframe":"MF-SP-03","componente":"SWAP","severidade":"moderada","status":"resolvido","inicio":"2026-10-09T22:55:27.272727-03:00","resolvidoEm":"2026-10-09T23:13:27.272727-03:00","reincidente":false},
        {"id":"ALT-190","mainframe":"MF-SP-04","componente":"CPU","severidade":"moderada","status":"resolvido","inicio":"2026-10-09T21:35:00-03:00","resolvidoEm":"2026-10-09T21:53:00-03:00","reincidente":false},
        {"id":"ALT-187","mainframe":"MF-SP-09","componente":"RAM","severidade":"moderada","status":"resolvido","inicio":"2026-10-09T20:21:52.500000-03:00","resolvidoEm":"2026-10-09T20:39:52.500000-03:00","reincidente":false},
        {"id":"ALT-184","mainframe":"MF-SP-05","componente":"CPU","severidade":"moderada","status":"resolvido","inicio":"2026-10-09T19:08:45-03:00","resolvidoEm":"2026-10-09T19:26:45-03:00","reincidente":false},
        {"id":"ALT-181","mainframe":"MF-SP-12","componente":"RAM","severidade":"moderada","status":"resolvido","inicio":"2026-10-09T17:35:00-03:00","resolvidoEm":"2026-10-09T17:53:00-03:00","reincidente":false},
        {"id":"ALT-178","mainframe":"MF-RJ-04","componente":"CPU","severidade":"moderada","status":"resolvido","inicio":"2026-10-09T15:57:30-03:00","resolvidoEm":"2026-10-09T16:15:30-03:00","reincidente":false},
        {"id":"ALT-175","mainframe":"MF-SP-12","componente":"DISCO","severidade":"moderada","status":"resolvido","inicio":"2026-10-09T14:20:00-03:00","resolvidoEm":"2026-10-09T14:38:00-03:00","reincidente":false},
        {"id":"ALT-100","mainframe":"MF-SP-07","componente":"RAM","severidade":"moderada","status":"resolvido","inicio":"2026-10-08T14:00:00-03:00","resolvidoEm":"2026-10-08T14:12:00-03:00","reincidente":false},
        {"id":"ALT-104","mainframe":"MF-SP-10","componente":"RAM","severidade":"moderada","status":"resolvido","inicio":"2026-10-07T14:00:00-03:00","resolvidoEm":"2026-10-07T14:12:00-03:00","reincidente":false},
        {"id":"ALT-108","mainframe":"MF-RJ-01","componente":"RAM","severidade":"moderada","status":"resolvido","inicio":"2026-10-06T14:00:00-03:00","resolvidoEm":"2026-10-06T14:12:00-03:00","reincidente":false},
        {"id":"ALT-112","mainframe":"MF-RJ-04","componente":"RAM","severidade":"moderada","status":"resolvido","inicio":"2026-10-05T14:00:00-03:00","resolvidoEm":"2026-10-05T14:12:00-03:00","reincidente":false},
        {"id":"ALT-116","mainframe":"MF-RJ-07","componente":"RAM","severidade":"moderada","status":"resolvido","inicio":"2026-10-04T14:00:00-03:00","resolvidoEm":"2026-10-04T14:12:00-03:00","reincidente":false},
    ]
};

let paginaAtual = 1;
let statusSelecionado = 'todos';
let alertasDoPeriodo = [];
let graficoFluxo;
let graficoComponentes;
let graficoTempo;

const agora = new Date(DADOS_DASHBOARD.atualizadoEm).getTime();
const umaHora = 60 * 60 * 1000;
const itensPorPagina = 5;
const nomesSeveridade = { critica: 'Crítica', alta: 'Alta', moderada: 'Moderada' };
const nomesStatus = { aberto: 'Aberto', investigacao: 'Em investigação', resolvido: 'Resolvido' };
const nomesComponentes = { RAM: 'RAM', CPU: 'CPU', DISCO: 'Disco', SWAP: 'Swap' };

const campoPeriodo = document.getElementById('filtro-periodo');
const campoLocalizacao = document.getElementById('filtro-localizacao');
const campoMainframe = document.getElementById('filtro-mainframe');
const campoBusca = document.getElementById('busca-mainframe');
const campoSeveridade = document.getElementById('filtro-severidade');
const campoComponente = document.getElementById('filtro-componente');
const botoesStatus = document.querySelectorAll('.alertas-abas button');

function escreverNaTela(idElemento, texto) {
    document.getElementById(idElemento).innerText = texto;
}

function formatarData(data) {
    return data.substring(8, 10) + '/' + data.substring(5, 7) + ' · ' + data.substring(11, 16);
}

function formatarTempo(minutos) {
    if (minutos < 60) return minutos + ' min';
    let horas = Math.floor(minutos / 60);
    let resto = minutos % 60;
    if (resto == 0) return horas + ' h';
    return horas + ' h ' + resto + ' min';
}

function calcularMinutos(alerta) {
    let fim = agora;
    if (alerta.status == 'resolvido') fim = new Date(alerta.resolvidoEm).getTime();
    let inicio = new Date(alerta.inicio).getTime();
    return Math.ceil((fim - inicio) / 60000);
}

function buscarLocalizacao(hostname) {
    for (let i = 0; i < DADOS_DASHBOARD.mainframes.length; i++) {
        if (DADOS_DASHBOARD.mainframes[i].hostname == hostname) {
            return DADOS_DASHBOARD.mainframes[i].localizacao;
        }
    }
    return '';
}

function preencherLocalizacoes() {
    let opcoes = '<option value="">Todas as localidades</option>';
    for (let i = 0; i < DADOS_DASHBOARD.localizacoes.length; i++) {
        let local = DADOS_DASHBOARD.localizacoes[i];
        opcoes += '<option value="' + local + '">' + local + '</option>';
    }
    campoLocalizacao.innerHTML = opcoes;
}

function preencherMainframes() {
    let escolhidoAntes = campoMainframe.value;
    let aindaExiste = false;
    let opcoes = '<option value="">Todos os mainframes</option>';

    for (let i = 0; i < DADOS_DASHBOARD.mainframes.length; i++) {
        let mainframe = DADOS_DASHBOARD.mainframes[i];
        if (campoLocalizacao.value == '' || mainframe.localizacao == campoLocalizacao.value) {
            opcoes += '<option value="' + mainframe.hostname + '">' + mainframe.hostname + '</option>';
            if (mainframe.hostname == escolhidoAntes) aindaExiste = true;
        }
    }

    campoMainframe.innerHTML = opcoes;
    if (aindaExiste) campoMainframe.value = escolhidoAntes;
}

function criarGraficos() {
    if (typeof Chart == 'undefined') {
        document.getElementById('erro-graficos').hidden = false;
        return;
    }

    graficoFluxo = new Chart(document.getElementById('grafico-fluxo'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                { label: 'Abertos', data: [], backgroundColor: '#1a1f71' },
                { label: 'Resolvidos', data: [], backgroundColor: '#16afb5' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { maxRotation: 0 } },
                y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Alertas' } }
            }
        }
    });

    graficoComponentes = new Chart(document.getElementById('grafico-componentes'), {
        type: 'bar',
        data: {
            labels: ['RAM', 'CPU', 'Disco', 'Swap'],
            datasets: [{ label: 'Alertas', data: [0, 0, 0, 0], backgroundColor: ['#3b479e', '#677acc', '#98a8e5', '#ced6f4'] }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, ticks: { precision: 0 } },
                y: { grid: { display: false } }
            }
        }
    });

    graficoTempo = new Chart(document.getElementById('grafico-tempo'), {
        type: 'bar',
        data: {
            labels: ['Até 15 min', '16–30 min', '31–60 min', '> 60 min'],
            datasets: [
                { label: 'Crítica', data: [0, 0, 0, 0], backgroundColor: '#e62f51' },
                { label: 'Alta', data: [0, 0, 0, 0], backgroundColor: '#ff8b38' },
                { label: 'Moderada', data: [0, 0, 0, 0], backgroundColor: '#ffd364' }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Alertas' } },
                y: { stacked: true, grid: { display: false } }
            }
        }
    });
}

function atualizarDashboard() {
    let horas = Number(campoPeriodo.value);
    let inicioPeriodo = agora - horas * umaHora;
    let quantidadeIntervalos = 6;
    if (horas == 168) quantidadeIntervalos = 7;
    let tamanhoIntervalo = horas * umaHora / quantidadeIntervalos;

    let legendas = [];
    let abertos = [];
    let resolvidos = [];
    let porComponente = [0, 0, 0, 0]; // RAM, CPU, Disco e Swap
    let criticos = [0, 0, 0, 0]; // Até 15, até 30, até 60 e mais de 60 minutos
    let altos = [0, 0, 0, 0];
    let moderados = [0, 0, 0, 0];

    for (let i = 0; i < quantidadeIntervalos; i++) {
        let fimIntervalo = new Date(inicioPeriodo + (i + 1) * tamanhoIntervalo);
        let legenda = fimIntervalo.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hourCycle: 'h23' }) + 'h';
        if (horas == 168) {
            legenda = fimIntervalo.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' });
        }
        legendas.push(legenda);
        abertos.push(0);
        resolvidos.push(0);
    }

    let totalMonitorados = 0;
    for (let i = 0; i < DADOS_DASHBOARD.mainframes.length; i++) {
        let mainframe = DADOS_DASHBOARD.mainframes[i];
        if (campoLocalizacao.value != '' && mainframe.localizacao != campoLocalizacao.value) continue;
        if (campoMainframe.value != '' && mainframe.hostname != campoMainframe.value) continue;
        totalMonitorados++;
    }

    let totalAtivos = 0;
    let totalResolvidos = 0;
    let totalReincidentes = 0;
    let somaMinutos = 0;
    let mainframesComAlertas = [];
    alertasDoPeriodo = [];

    for (let i = 0; i < DADOS_DASHBOARD.alertas.length; i++) {
        let alerta = DADOS_DASHBOARD.alertas[i];
        if (campoLocalizacao.value != '' && buscarLocalizacao(alerta.mainframe) != campoLocalizacao.value) continue;
        if (campoMainframe.value != '' && alerta.mainframe != campoMainframe.value) continue;

        let inicio = new Date(alerta.inicio).getTime();
        if (inicio > agora) continue;

        // Os indicadores "Agora" contam todas as pendências, independentemente do período.
        if (alerta.status != 'resolvido') {
            totalAtivos++;
            if (mainframesComAlertas.indexOf(alerta.mainframe) == -1) mainframesComAlertas.push(alerta.mainframe);

            let minutos = calcularMinutos(alerta);
            let faixa = 0;
            if (minutos > 15) faixa = 1;
            if (minutos > 30) faixa = 2;
            if (minutos > 60) faixa = 3;
            if (alerta.severidade == 'critica') criticos[faixa]++;
            if (alerta.severidade == 'alta') altos[faixa]++;
            if (alerta.severidade == 'moderada') moderados[faixa]++;
        }

        if (inicio >= inicioPeriodo) {
            alertasDoPeriodo.push(alerta);
            if (alerta.reincidente) totalReincidentes++;
            if (alerta.componente == 'RAM') porComponente[0]++;
            if (alerta.componente == 'CPU') porComponente[1]++;
            if (alerta.componente == 'DISCO') porComponente[2]++;
            if (alerta.componente == 'SWAP') porComponente[3]++;

            let posicao = Math.floor((inicio - inicioPeriodo) / tamanhoIntervalo);
            if (posicao >= quantidadeIntervalos) posicao = quantidadeIntervalos - 1;
            abertos[posicao]++;
        }

        if (alerta.status == 'resolvido') {
            let fim = new Date(alerta.resolvidoEm).getTime();
            if (fim >= inicioPeriodo && fim <= agora) {
                totalResolvidos++;
                somaMinutos += (fim - inicio) / 60000;
                let posicao = Math.floor((fim - inicioPeriodo) / tamanhoIntervalo);
                if (posicao >= quantidadeIntervalos) posicao = quantidadeIntervalos - 1;
                resolvidos[posicao]++;
            }
        }
    }

    escreverNaTela('kpi-ativos', totalAtivos);
    escreverNaTela('kpi-mainframes', mainframesComAlertas.length + ' / ' + totalMonitorados);
    escreverNaTela('kpi-resolucao', '—');
    escreverNaTela('kpi-reincidencia', '—');
    if (totalResolvidos > 0) escreverNaTela('kpi-resolucao', formatarTempo(Math.round(somaMinutos / totalResolvidos)));
    if (alertasDoPeriodo.length > 0) {
        let percentual = totalReincidentes / alertasDoPeriodo.length * 100;
        escreverNaTela('kpi-reincidencia', percentual.toFixed(1).replace('.', ',') + '%');
    }
    escreverNaTela('total-abertos', alertasDoPeriodo.length);
    escreverNaTela('total-resolvidos', totalResolvidos);
    document.getElementById('vazio-fluxo').hidden = alertasDoPeriodo.length + totalResolvidos > 0;
    document.getElementById('vazio-componentes').hidden = alertasDoPeriodo.length > 0;
    document.getElementById('vazio-tempo').hidden = totalAtivos > 0;

    if (graficoFluxo) {
        graficoFluxo.data.labels = legendas;
        graficoFluxo.data.datasets[0].data = abertos;
        graficoFluxo.data.datasets[1].data = resolvidos;
        graficoFluxo.update();
        graficoComponentes.data.datasets[0].data = porComponente;
        graficoComponentes.update();
        graficoTempo.data.datasets[0].data = criticos;
        graficoTempo.data.datasets[1].data = altos;
        graficoTempo.data.datasets[2].data = moderados;
        graficoTempo.update();
    }
    atualizarTabela();
}

function atualizarTabela() {
    let lista = [];
    let contadores = { todos: 0, aberto: 0, investigacao: 0, resolvido: 0 };
    let busca = campoBusca.value.trim().toLowerCase();

    for (let i = 0; i < alertasDoPeriodo.length; i++) {
        let alerta = alertasDoPeriodo[i];
        if (alerta.mainframe.toLowerCase().indexOf(busca) == -1) continue;
        if (campoSeveridade.value != '' && alerta.severidade != campoSeveridade.value) continue;
        if (campoComponente.value != '' && alerta.componente != campoComponente.value) continue;
        contadores.todos++;
        contadores[alerta.status]++;
        if (statusSelecionado == 'todos' || alerta.status == statusSelecionado) lista.push(alerta);
    }

    escreverNaTela('contador-todos', contadores.todos);
    escreverNaTela('contador-aberto', contadores.aberto);
    escreverNaTela('contador-investigacao', contadores.investigacao);
    escreverNaTela('contador-resolvido', contadores.resolvido);

    let totalPaginas = Math.ceil(lista.length / itensPorPagina);
    if (totalPaginas == 0) totalPaginas = 1;
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    let primeiro = (paginaAtual - 1) * itensPorPagina;
    let ultimo = primeiro + itensPorPagina;
    if (ultimo > lista.length) ultimo = lista.length;

    let linhas = '';
    for (let i = primeiro; i < ultimo; i++) {
        let alerta = lista[i];
        let classe = '';

        // Todos os valores inseridos aqui vêm da constante de dados simulados.
        linhas += `<tr class="${classe}">
            <td><strong>${alerta.mainframe}</strong></td>
            <td><span class="alertas-badge severidade-${alerta.severidade}">${nomesSeveridade[alerta.severidade]}</span></td>
            <td>${nomesComponentes[alerta.componente]}</td>
            <td><time datetime="${alerta.inicio}">${formatarData(alerta.inicio)}</time></td>
            <td>${formatarTempo(calcularMinutos(alerta))}</td>
            <td><span class="alertas-badge status-${alerta.status}">${nomesStatus[alerta.status]}</span></td>
        </tr>`;
    }

    if (lista.length == 0) {
        linhas = '<tr><td colspan="6" class="alertas-sem-resultados">Nenhum alerta encontrado para os filtros selecionados.</td></tr>';
        escreverNaTela('resumo-paginacao', 'Nenhum alerta encontrado');
    } else {
        escreverNaTela('resumo-paginacao', 'Mostrando ' + (primeiro + 1) + '–' + ultimo + ' de ' + lista.length + ' alertas');
    }
    document.getElementById('corpo-alertas').innerHTML = linhas;
    montarPaginacao(totalPaginas, lista.length);
}

// 7. PAGINAÇÃO E BOTÕES DE STATUS
function montarPaginacao(totalPaginas, totalAlertas) {
    let desabilitado = '';
    if (paginaAtual == 1) desabilitado = 'disabled';
    let botoes = `<button type="button" aria-label="Página anterior" onclick="mudarPagina(${paginaAtual - 1})" ${desabilitado}>‹</button>`;
    let ultimaMostrada = 0;

    for (let i = 1; i <= totalPaginas; i++) {
        if (totalPaginas <= 5 || i == 1 || i == totalPaginas || Math.abs(i - paginaAtual) <= 1 || (paginaAtual < 3 && i <= 3) || (paginaAtual > totalPaginas - 2 && i >= totalPaginas - 2)) {
            if (i - ultimaMostrada > 1) botoes += '<span class="alertas-reticencias">…</span>';
            let selecionada = '';
            if (i == paginaAtual) selecionada = 'aria-current="page"';
            desabilitado = '';
            if (totalAlertas == 0) desabilitado = 'disabled';
            botoes += `<button type="button" aria-label="Página ${i}" onclick="mudarPagina(${i})" ${selecionada} ${desabilitado}>${i}</button>`;
            ultimaMostrada = i;
        }
    }

    desabilitado = '';
    if (paginaAtual == totalPaginas) desabilitado = 'disabled';
    botoes += `<button type="button" aria-label="Próxima página" onclick="mudarPagina(${paginaAtual + 1})" ${desabilitado}>›</button>`;
    document.getElementById('paginacao-alertas').innerHTML = botoes;
}

function mudarPagina(numero) {
    paginaAtual = numero;
    atualizarTabela();
}

function mudarStatus(status) {
    statusSelecionado = status;
    paginaAtual = 1;
    for (let i = 0; i < botoesStatus.length; i++) {
        botoesStatus[i].className = '';
        botoesStatus[i].setAttribute('aria-pressed', 'false');
        if (botoesStatus[i].getAttribute('data-status') == status) {
            botoesStatus[i].className = 'ativa';
            botoesStatus[i].setAttribute('aria-pressed', 'true');
        }
    }
    atualizarTabela();
}

// 8. LIGAR OS CAMPOS ÀS FUNÇÕES
campoPeriodo.onchange = function () {
    paginaAtual = 1;
    atualizarDashboard();
};
campoLocalizacao.onchange = function () {
    paginaAtual = 1;
    preencherMainframes();
    atualizarDashboard();
};
campoMainframe.onchange = function () {
    paginaAtual = 1;
    atualizarDashboard();
};
campoBusca.oninput = function () {
    paginaAtual = 1;
    atualizarTabela();
};
campoSeveridade.onchange = function () {
    paginaAtual = 1;
    atualizarTabela();
};
campoComponente.onchange = function () {
    paginaAtual = 1;
    atualizarTabela();
};
for (let i = 0; i < botoesStatus.length; i++) {
    botoesStatus[i].onclick = function () {
        mudarStatus(this.getAttribute('data-status'));
    };
}

let dataAtualizacao = DADOS_DASHBOARD.atualizadoEm;
escreverNaTela('data-atualizacao', dataAtualizacao.substring(8, 10) + '/' + dataAtualizacao.substring(5, 7) + '/' + dataAtualizacao.substring(0, 4) + ' às ' + dataAtualizacao.substring(11, 16));
document.getElementById('data-atualizacao').setAttribute('datetime', dataAtualizacao);
preencherLocalizacoes();
preencherMainframes();
criarGraficos();
atualizarDashboard();
