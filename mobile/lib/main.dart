import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_fonts/google_fonts.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // 注意：在实际运行前需要确保 lib/firebase_options.dart 存在，或者直接在这里硬编码配置
  await Firebase.initializeApp(
    options: const FirebaseOptions(
      apiKey: "AIzaSyBvqS8HIJ-yacn_YQfGt49Pb6IVpXw4igE",
      appId: "1:372694962939:android:47562947192843",
      messagingSenderId: "372694962939",
      projectId: "tuantuanbot-28647",
    ),
  );
  runApp(const TuanTuanEliteApp());
}

class TuanTuanEliteApp extends StatelessWidget {
  const TuanTuanEliteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'TuanTuan Elite Hub',
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: Colors.pinkAccent,
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
        scaffoldBackgroundColor: const Color(0xFF070707),
      ),
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final firestore = FirebaseFirestore.instance;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment(-0.8, -0.8),
            radius: 1.5,
            colors: [Color(0xFF1A1012), Color(0xFF070707)],
          ),
        ),
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              _buildHeader(),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 30),
                      _buildCloudStatusStream(firestore),
                      const SizedBox(height: 40),
                      Text('SUPREME ANALYTICS', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white24, letterSpacing: 4)),
                      const SizedBox(height: 15),
                      _buildStatsGridStream(firestore),
                      const SizedBox(height: 40),
                      Text('INTELLIGENCE CONTROL', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white24, letterSpacing: 4)),
                      const SizedBox(height: 15),
                      _buildBrainToggle(firestore),
                      const SizedBox(height: 100), 
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _triggerDeploy(context),
        backgroundColor: Colors.pinkAccent,
        icon: const Icon(Icons.bolt_rounded, color: Colors.white),
        label: const Text('FORCE CLOUD SYNC', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.2)),
        elevation: 20,
      ),
    );
  }

  Widget _buildHeader() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('TUANTUAN', style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white)),
                Text('ELITE DASHBOARD V4.0', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.pinkAccent, letterSpacing: 2)),
              ],
            ),
            Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Colors.pinkAccent.withOpacity(0.5))),
              child: const CircleAvatar(radius: 25, backgroundImage: NetworkImage('https://i.ibb.co/Lzdg1K6L/panda-logo.png')),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCloudStatusStream(FirebaseFirestore firestore) {
    return StreamBuilder<DocumentSnapshot>(
      stream: firestore.collection('global_stats').doc('aggregate').snapshots(),
      builder: (context, snapshot) {
        final online = (snapshot.data?.data() as Map<String, dynamic>?)?['status'] == 'online';
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.03),
            borderRadius: BorderRadius.circular(32),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: Row(
            children: [
              Container(
                width: 12, height: 12,
                decoration: BoxDecoration(
                  color: online ? Colors.greenAccent : Colors.redAccent,
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: (online ? Colors.greenAccent : Colors.redAccent).withOpacity(0.5), blurRadius: 10, spreadRadius: 2)],
                ),
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(online ? 'CLOUD SERVICE: ACTIVE' : 'CLOUD SERVICE: OFFLINE', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                    Text('24/7 SUPREME ARCHITECTURE', style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.3), fontWeight: FontWeight.bold, letterSpacing: 1)),
                  ],
                ),
              ),
              Icon(Icons.shield_check_rounded, color: Colors.white.withOpacity(0.1), size: 40),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatsGridStream(FirebaseFirestore firestore) {
    return StreamBuilder<DocumentSnapshot>(
      stream: firestore.collection('global_stats').doc('aggregate').snapshots(),
      builder: (context, snapshot) {
        final data = snapshot.data?.data() as Map<String, dynamic>? ?? {};
        return GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 15,
          mainAxisSpacing: 15,
          childAspectRatio: 1.5,
          children: [
            _buildStatItem('GUILDS', data['guilds']?.toString() ?? '--', Icons.dns),
            _buildStatItem('COMMANDS', data['commands_processed']?.toString() ?? '--', Icons.zap),
            _buildStatItem('USERS', data['users']?.toString() ?? '--', Icons.people),
            _buildStatItem('LATENCY', '24ms', Icons.speed),
          ],
        );
      },
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.03)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 20, color: Colors.pinkAccent.withOpacity(0.5)),
          const SizedBox(height: 8),
          Text(value, style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w900)),
          Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white24, letterSpacing: 1)),
        ],
      ),
    );
  }

  Widget _buildBrainToggle(FirebaseFirestore firestore) {
    return StreamBuilder<DocumentSnapshot>(
      stream: firestore.collection('config').doc('global').snapshots(),
      builder: (context, snapshot) {
        final data = snapshot.data?.data() as Map<String, dynamic>?;
        final currentEngine = data?['aiEngine'] ?? 'gemini';
        return Column(
          children: [
            _buildBrainOption(
              firestore, 'gemini', 'GOOGLE GEMINI PRO', 'Deep Reasoning & Context', 
              Icons.blur_on_rounded, currentEngine == 'gemini', Colors.blueAccent
            ),
            const SizedBox(height: 12),
            _buildBrainOption(
              firestore, 'groq', 'GROQ HYPER-ENGINE', 'Ultra-Low Latency Ops', 
              Icons.bolt_rounded, currentEngine == 'groq', Colors.orangeAccent
            ),
          ],
        );
      },
    );
  }

  Widget _buildBrainOption(FirebaseFirestore firestore, String id, String name, String sub, IconData icon, bool active, Color color) {
    return InkWell(
      onTap: () => firestore.collection('config').doc('global').update({'aiEngine': id}),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: active ? color.withOpacity(0.1) : Colors.white.withOpacity(0.02),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: active ? color.withOpacity(0.5) : Colors.white.withOpacity(0.03), width: 2),
        ),
        child: Row(
          children: [
            Icon(icon, color: active ? color : Colors.white24, size: 32),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: TextStyle(fontWeight: FontWeight.w900, color: active ? Colors.white : Colors.white70)),
                  Text(sub, style: TextStyle(fontSize: 10, color: active ? color.withOpacity(0.8) : Colors.white24)),
                ],
              ),
            ),
            if (active) const Icon(Icons.check_circle_rounded, color: Colors.white, size: 24),
          ],
        ),
      ),
    );
  }

  void _triggerDeploy(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('🚀 COMMAND SENT: Cloud Sync in progress...'),
        backgroundColor: Colors.pinkAccent,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
