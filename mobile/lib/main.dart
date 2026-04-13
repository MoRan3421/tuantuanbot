import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_fonts/google_fonts.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // 注意：在实际运行前需要执行 flutterfire configure 初始化您的 Firebase
  // await Firebase.initializeApp(); 
  runApp(const TuanTuanSupremeApp());
}

class TuanTuanSupremeApp extends StatelessWidget {
  const TuanTuanSupremeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TuanTuan Elite Control',
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.pink,
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
        scaffoldBackgroundColor: const Color(0xFF0F0F0F),
      ),
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200.0,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: const Text('团团至尊中控台 🐼', style: TextStyle(fontWeight: FontWeight.bold)),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFff9a9e), Color(0xFFfad0c4)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: const Center(
                  child: Icon(Icons.auto_awesome, size: 80, color: Colors.white70),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   _buildStatusSection(),
                   const SizedBox(height: 24),
                   const Text('🚀 快捷操作', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                   const SizedBox(height: 12),
                   _buildActionGrid(),
                   const SizedBox(height: 24),
                   const Text('📊 实时日志流', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                   _buildLogPreview(),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        label: const Text('重启云端 Bot'),
        icon: const Icon(Icons.refresh),
        backgroundColor: Colors.pinkAccent,
      ),
    );
  }

  Widget _buildStatusSection() {
    return Row(
      children: [
        _buildStatCard('服务器', '420', Icons.dns_rounded, Colors.blueAccent),
        const SizedBox(width: 12),
        _buildStatCard('活跃用户', '12,580', Icons.people_alt_rounded, Colors.orangeAccent),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 30),
            const SizedBox(height: 12),
            Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text(label, style: TextStyle(color: Colors.grey[400])),
          ],
        ),
      ),
    );
  }

  Widget _buildActionGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 2.5,
      children: [
        _buildActionButton('发布全局公告', Icons.campaign_rounded, Colors.purpleAccent),
        _buildActionButton('修改 AI 提示词', Icons.psychology_rounded, Colors.tealAccent),
        _buildActionButton('生成精英卡密', Icons.vpn_key_rounded, Colors.amberAccent),
        _buildActionButton('查看财务报表', Icons.payments_rounded, Colors.greenAccent),
      ],
    );
  }

  Widget _buildActionButton(String label, IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 14)),
        ],
      ),
    );
  }

  Widget _buildLogPreview() {
    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(16),
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white10),
      ),
      child: const SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('[00:15:20] 🟢 TuanTuan Core v8.0 is ONLINE', style: TextStyle(color: Colors.green, fontFamily: 'monospace')),
            Text('[00:15:25] 📊 XP奖励分发完成: 42名玩家', style: TextStyle(color: Colors.white70, fontFamily: 'monospace')),
            Text('[00:15:28] 🧠 AI 回答成功 (Llama-3.3)', style: TextStyle(color: Colors.blue, fontFamily: 'monospace')),
            Text('[00:15:35] ⚠️ 跨服漫游：服务器A同步至服务器B', style: TextStyle(color: Colors.amber, fontFamily: 'monospace')),
          ],
        ),
      ),
    );
  }
}
