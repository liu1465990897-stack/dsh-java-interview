window.__ModuleLoader__.load({
  id: '@local/dsh-java-interview',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useMemo, useRef, useState } = React;

    /** Locale namespace owned by this plugin. */
    const NS = 'plugin.java-interview';
    /** The `main` key and the `sidebar.panellist` id share this value. */
    const PANEL_ID = 'java-interview';
    /** One batch is ten questions, as requested. */
    const PAGE_SIZE = 10;
    const FAV_KEY = 'dsh.java-interview.favorites.v1';
    /** Questions added through the import dialog live here, not in BANK. */
    const IMPORT_KEY = 'dsh.java-interview.imported.v1';

    const TOPICS = [
      { id: 'basic' },
      { id: 'collection' },
      { id: 'concurrent' },
      { id: 'jvm' },
      { id: 'spring' },
      { id: 'mysql' },
      { id: 'redis' },
      { id: 'mq' },
      { id: 'distributed' },
    ];

    /**
     * The question bank. `a` holds the answer as points: the first point
     * answers directly, the rest carry the detail interviewers follow up on.
     * The questions stay in Chinese on purpose — they are the product; only
     * the surrounding chrome is localized.
     */
    const BANK = [
      // ------------------------------------------------------------ 基础
      { id: 'b01', topic: 'basic', freq: 5, diff: 1, q: 'JDK、JRE、JVM 有什么区别？', a: [
        'JVM 是执行字节码的虚拟机，负责「一次编写，到处运行」；JRE 是 JVM 加核心类库，只能运行 Java 程序；JDK 是 JRE 加 javac、jdb、jar 等工具，用于开发。',
        '包含关系：JDK ⊃ JRE ⊃ JVM。只部署运行环境装 JRE 即可，开发必须装 JDK。',
      ] },
      { id: 'b02', topic: 'basic', freq: 5, diff: 1, q: '== 和 equals 有什么区别？', a: [
        '== 比较基本类型的值，或引用类型的内存地址；equals 是 Object 的方法，默认实现等价于 ==，被重写后比较内容。',
        '判断两个对象是否「相等」用重写后的 equals，判断是否为同一个对象才用 ==。',
      ] },
      { id: 'b03', topic: 'basic', freq: 5, diff: 3, q: '为什么重写 equals 必须同时重写 hashCode？', a: [
        '哈希容器的约定是：equals 相等的两个对象 hashCode 必须相等，否则存进去的对象用等价的 key 取不出来。',
        '只重写 equals 会让 HashMap、HashSet 的去重与查找同时失效，因为两者先用 hashCode 定位桶，再用 equals 比较。',
      ] },
      { id: 'b04', topic: 'basic', freq: 5, diff: 2, q: 'String 为什么被设计成不可变？', a: [
        '内部字符数组被 final 修饰且不对外暴露，所有「修改」方法都返回新对象。',
        '好处：可安全地作为 HashMap 的 key、天然线程安全、字符串常量池可以复用、类加载与网络传输时不会被篡改。',
      ] },
      { id: 'b05', topic: 'basic', freq: 5, diff: 1, q: 'String、StringBuilder、StringBuffer 的区别？', a: [
        'String 不可变，每次拼接都产生新对象；StringBuilder 可变、非线程安全、性能最好；StringBuffer 可变、方法加 synchronized、线程安全。',
        '单线程或方法内部拼接用 StringBuilder；循环体内避免用 String 的 + 拼接。',
      ] },
      { id: 'b06', topic: 'basic', freq: 4, diff: 2, q: 'final、finally、finalize 有什么区别？', a: [
        'final 修饰类不可继承、方法不可重写、变量不可再次赋值（引用不可变，对象内容仍可变）。',
        'finally 是 try 之后必定执行的代码块，用于释放资源；finalize 是对象被回收前的回调，已被废弃，不要依赖它释放资源。',
      ] },
      { id: 'b07', topic: 'basic', freq: 4, diff: 2, q: '接口和抽象类应该如何选择？', a: [
        '抽象类描述 is-a 的模板关系，可以有构造器、成员变量和状态；接口描述 can-do 的能力契约，一个类可以实现多个。',
        '需要复用状态或提供模板方法时用抽象类；只定义行为契约、希望多实现时用接口。JDK 8 后接口可有 default 与 static 方法，但仍不能有实例状态。',
      ] },
      { id: 'b08', topic: 'basic', freq: 4, diff: 1, q: '重载和重写的区别？', a: [
        '重载（Overload）发生在同一个类中，方法名相同、参数列表不同，编译期根据静态类型决定调用哪个。',
        '重写（Override）发生在父子类之间，方法签名相同，访问权限不能更小、异常不能更宽，运行期动态绑定，是多态的基础。',
      ] },
      { id: 'b09', topic: 'basic', freq: 3, diff: 4, q: 'Java 的四种引用及各自的使用场景？', a: [
        '强引用：正常 new 出来的对象，只要可达就永不回收；软引用：内存不足时回收，适合做缓存。',
        '弱引用：下一次 GC 必定回收，ThreadLocalMap 的 key 就用弱引用；虚引用：仅用于对象被回收时收到通知，需配合 ReferenceQueue。',
      ] },
      { id: 'b10', topic: 'basic', freq: 4, diff: 3, q: '自动装箱拆箱的原理？Integer 的缓存范围是多少？', a: [
        '装箱调用 Integer.valueOf，拆箱调用 intValue，编译器自动插入这些调用；在循环里对包装类型做运算会产生大量临时对象。',
        'Integer 默认缓存 -128~127（可用 -XX:AutoBoxCacheMax 调整上限），所以该区间内 == 为 true，超出为 false，比较值必须用 equals。',
      ] },
      { id: 'b11', topic: 'basic', freq: 4, diff: 2, q: '异常体系是怎样的？try-with-resources 有什么用？', a: [
        'Throwable 分 Error（JVM 级严重问题，不应捕获）和 Exception；Exception 又分受检异常和 RuntimeException。',
        'try-with-resources 在代码块结束时按逆序自动调用 AutoCloseable.close()，关闭时的异常作为 suppressed 挂到主异常上而不是覆盖它。',
      ] },
      { id: 'b12', topic: 'basic', freq: 4, diff: 4, q: '什么是泛型擦除？带来了哪些限制？', a: [
        '泛型只在编译期存在，编译后类型参数被擦除为上界（默认 Object），所以运行时拿不到真实的类型参数。',
        '限制：不能 new T[]、不能对泛型做 instanceof、静态成员不能使用类型参数、不能仅靠泛型参数不同来重载。',
      ] },
      { id: 'b13', topic: 'basic', freq: 3, diff: 3, q: '深拷贝与浅拷贝的区别？如何实现深拷贝？', a: [
        '浅拷贝只复制引用，内部对象仍然共享；深拷贝递归复制所有层级，两个对象完全独立。',
        '实现方式：逐层重写 clone、序列化再反序列化、拷贝构造器，或用 JSON 转换（注意会丢失类型与循环引用）。',
      ] },
      { id: 'b14', topic: 'basic', freq: 5, diff: 1, q: '面向对象的三大特性是什么？各自解决了什么问题？', a: [
        '封装隐藏实现细节、只暴露必要接口；继承复用并扩展父类能力；多态让同一调用在不同对象上表现出不同行为。',
        '多态依赖继承或实现、方法重写、父类引用指向子类对象，调用在运行期动态绑定；设计上优先组合而非继承。',
      ] },
      { id: 'b15', topic: 'basic', freq: 4, diff: 2, q: 'static 可以修饰什么？静态内部类和非静态内部类有什么区别？', a: [
        'static 修饰成员变量、方法、代码块和内部类：静态成员属于类、被所有实例共享；静态方法没有 this，不能直接访问实例成员，也不能被重写。',
        '静态内部类不持有外部类引用，可独立创建实例；非静态内部类隐式持有外部类 this，容易造成内存泄漏。',
        '静态代码块在类初始化时执行一次，常用于加载配置；静态变量在类卸载前一直存活，不要缓存大对象。',
      ] },
      { id: 'b16', topic: 'basic', freq: 3, diff: 2, q: '成员变量和局部变量有什么区别？Java 是值传递吗？', a: [
        '成员变量属于对象，有默认值，随对象存放在堆中；局部变量必须显式初始化，存在栈帧中，作用域仅限方法或代码块。',
        'Java 只有值传递：基本类型传值副本，引用类型传引用的副本，方法内重新赋值不影响外部，但改对象内容会影响外部。',
        '局部变量不能被 static 修饰；局部内部类访问的局部变量在 JDK 8 后只需 effectively final，不必显式加 final。',
      ] },
      { id: 'b17', topic: 'basic', freq: 4, diff: 4, q: '类加载时静态块、实例块、构造器和字段初始化的执行顺序是怎样的？', a: [
        '父类静态成员与静态块 → 子类静态块 → 父类实例成员与实例块 → 父类构造器 → 子类实例成员与实例块 → 子类构造器；静态部分只执行一次。',
        '同级按代码书写顺序执行；字段初始化先于构造器，所以父类构造器执行时子类字段仍是默认值。',
        '触发类初始化的时机：new 实例、访问静态成员、反射、初始化子类；static final 常量在编译期内联，访问它不会触发初始化。',
      ] },
      { id: 'b18', topic: 'basic', freq: 4, diff: 2, q: 'Object 有哪些常用方法？各自的作用和约定是什么？', a: [
        'equals 判断逻辑相等，重写时必须同时重写 hashCode；hashCode 供哈希容器定位；toString 返回可读描述；getClass 返回运行时类。',
        'clone 需实现 Cloneable，默认是浅拷贝；wait、notify、notifyAll 定义在 Object 上，因为锁是对象级监视器；finalize 已废弃。',
        'equals 要满足自反、对称、传递、一致，与 null 比较返回 false；toString 应包含关键字段，避免只输出对象地址。',
      ] },
      { id: 'b19', topic: 'basic', freq: 3, diff: 3, q: '反射的原理是什么？有哪些用途和代价？', a: [
        'JVM 为每个类保留一个 Class 对象，反射通过它读取字段、方法、构造器等元数据并在运行时动态调用，核心是 setAccessible。',
        '用途：依赖注入、ORM 映射、JSON 序列化、动态代理和注解解析；代价是绕过编译期检查、性能更低、破坏封装。',
        '优化：缓存 Method 与 Field，或用 MethodHandle 提升调用性能；JDK 9 后模块系统对 setAccessible 有更严格的限制。',
      ] },
      { id: 'b20', topic: 'basic', freq: 2, diff: 3, q: '注解的原理是什么？如何自定义一个注解？', a: [
        '注解本质是继承 Annotation 的接口，编译后作为元数据写入 class 文件，运行时靠反射读取；@Retention 决定保留阶段。',
        '自定义用 @interface 声明，配合 @Target 指定位置、@Retention(RUNTIME) 保证反射可读；注解本身没有逻辑，需要解析器赋予语义。',
        '注解不能继承，方法不能有参数和异常声明，返回值只能是基本类型、String、Class、枚举、注解或其数组；重复注解用 @Repeatable。',
      ] },
      { id: 'b21', topic: 'basic', freq: 4, diff: 4, q: 'JDK 动态代理和 CGLIB 有什么区别？各自适用于什么场景？', a: [
        'JDK 动态代理基于接口，用 Proxy 和 InvocationHandler 生成实现同一接口的代理类；CGLIB 基于继承生成子类，无法代理 final 类和方法。',
        'Spring 有接口时默认 JDK 代理，无接口用 CGLIB，Boot 2.x 起默认 CGLIB；代理内部方法自调用不会再次进入切面。',
        'JDK 代理只能增强接口方法，注入时要用接口类型接收；CGLIB 用 ASM 生成子类，创建开销大，但可缓存代理类复用。',
      ] },
      { id: 'b22', topic: 'basic', freq: 3, diff: 2, q: '枚举的本质是什么？为什么枚举单例是线程安全且防序列化的？', a: [
        '枚举编译后是继承 Enum 的 final 类，常量是静态实例、构造器私有，反射也无法创建实例，JVM 保证初始化只执行一次。',
        '枚举序列化只写 name，反序列化由 JVM 返回同一实例，所以枚举单例天然线程安全且防序列化破坏。',
        '普通类实现 Serializable 应显式声明 serialVersionUID，否则类结构变化后反序列化会抛 InvalidClassException。',
      ] },
      { id: 'b23', topic: 'basic', freq: 5, diff: 3, q: 'Lambda、Stream 和 Optional 的底层原理与常见坑是什么？', a: [
        'Lambda 是函数式接口的实例，编译后由 invokedynamic 生成，不是匿名内部类；接口只能有一个抽象方法，可用 @FunctionalInterface 校验。',
        'Stream 惰性求值，中间操作只构建、终止操作才执行，一条流只能消费一次；parallelStream 共用 commonPool，数据量小时更慢。',
        'Optional 用于表达返回值可能为空，别用作字段或参数；orElse 总会执行参数，需要惰性求值时用 orElseGet。',
      ] },
      { id: 'b24', topic: 'basic', freq: 2, diff: 3, q: 'Java 9 到 17 有哪些值得关注的新特性？', a: [
        '9 引入模块化、集合工厂方法和接口私有方法；10 支持 var；11 标准化 HttpClient 并可直接运行单文件源码；12 起 switch 表达式转正。',
        '14 引入 record；16 支持 instanceof 模式匹配；17 密封类转正、增强伪随机数；G1 自 9 起为默认 GC，ZGC 适合低延迟。',
        '日常最常用 var、List.of、文本块、record 和 switch 表达式；注意 List.of 返回不可变集合，调用 add 会抛异常。',
      ] },
      { id: 'b25', topic: 'basic', freq: 4, diff: 4, q: 'String 的 intern 方法有什么作用？字符串常量池是如何运作的？', a: [
        'intern 先查常量池，存在则返回池中引用，不存在则把当前引用放入池中，可用它把运行时拼出的字符串归一化、减少重复对象。',
        '字面量编译期入池，new String 在堆上创建对象；JDK 7 起常量池移到堆中，intern 后 == 结果与版本有关，判断相等仍应用 equals。',
        'new String 会创建堆对象和池中字面量两个对象；循环里大量 intern 会加重常量池负担，甚至触发 Full GC。',
      ] },
      { id: 'b26', topic: 'basic', freq: 3, diff: 3, q: 'Arrays.asList 有哪些坑？可变参数方法要注意什么？', a: [
        'Arrays.asList 返回固定长度列表，底层就是原数组，add 和 remove 会抛 UnsupportedOperationException，改元素会同步改原数组。',
        '传入基本类型数组时整个数组被当成一个元素；要可变列表时用 new ArrayList 包一层，要完全不可变用 List.of。',
        '可变参数本质是数组，重载时优先匹配固定参数；传入 null 会产生歧义并可能空指针，热路径上频繁创建数组也有开销。',
      ] },

      // ------------------------------------------------------------ 集合
      { id: 'c01', topic: 'collection', freq: 5, diff: 1, q: 'ArrayList 和 LinkedList 的区别？如何选择？', a: [
        'ArrayList 基于动态数组，随机访问 O(1)，中间插入删除需要移动元素；LinkedList 基于双向链表，已定位时插入删除 O(1)，随机访问 O(n)。',
        '绝大多数场景选 ArrayList（缓存友好、内存紧凑）；需要频繁头尾操作时用 ArrayDeque，LinkedList 的实际使用场景很少。',
      ] },
      { id: 'c02', topic: 'collection', freq: 4, diff: 2, q: 'ArrayList 的扩容机制是怎样的？', a: [
        '默认容量 10，首次 add 时才真正分配数组；扩容为 oldCapacity + (oldCapacity >> 1)，即约 1.5 倍，通过 Arrays.copyOf 迁移数据。',
        '已知数据规模时用 new ArrayList<>(size) 预设容量，避免反复扩容与数组拷贝。',
      ] },
      { id: 'c03', topic: 'collection', freq: 5, diff: 4, q: 'HashMap 的底层结构（JDK 8）与 put 流程？', a: [
        '数组 + 链表 + 红黑树：链表长度达到 8 且数组容量不小于 64 时转红黑树，退化阈值为 6。',
        'put 流程：扰动函数算 hash → 定位桶 → 空桶直接放 → 命中则比较 hash 与 equals，相同则覆盖，否则尾插链表或插入红黑树 → 判断树化 → 最后判断是否需要扩容。',
      ] },
      { id: 'c04', topic: 'collection', freq: 4, diff: 4, q: 'HashMap 的容量为什么必须是 2 的幂？扩容时如何 rehash？', a: [
        '容量为 2 的幂时，(n-1) & hash 等价于取模，位运算更快，且能保证散列均匀。',
        'JDK 8 扩容时不重新计算 hash，只判断 hash 与原容量对应的那一位：为 0 留在原索引，为 1 移到「原索引 + 原容量」，因此链表被拆成两条。',
      ] },
      { id: 'c05', topic: 'collection', freq: 5, diff: 4, q: 'HashMap 为什么线程不安全？ConcurrentHashMap 如何保证并发安全？', a: [
        '并发 put 会互相覆盖、扩容期间可能读到旧数据、size 统计不准；JDK 7 的头插法在并发扩容时还可能形成环形链表导致死循环。',
        'JDK 8 的 ConcurrentHashMap 用 CAS 插入空桶、用 synchronized 锁住单个桶的头节点，扩容支持多线程协同迁移，size 用 baseCount + CounterCell 分段统计。',
      ] },
      { id: 'c06', topic: 'collection', freq: 3, diff: 2, q: 'HashMap、LinkedHashMap、TreeMap 的区别？', a: [
        'HashMap 无序，增删改查平均 O(1)；LinkedHashMap 在 HashMap 基础上维护双向链表，可保持插入序或访问序，是 LRU 缓存的常用实现。',
        'TreeMap 基于红黑树，按 key 排序，操作 O(log n)，支持范围查询与取首尾。',
      ] },
      { id: 'c07', topic: 'collection', freq: 3, diff: 1, q: 'HashSet 如何保证元素不重复？', a: [
        '内部就是一个 HashMap，元素作为 key，value 是固定的 PRESENT 对象。',
        '去重靠 hashCode 定位桶，再用 equals 比较，所以自定义对象必须正确重写这两个方法。',
      ] },
      { id: 'c08', topic: 'collection', freq: 4, diff: 3, q: 'fail-fast 与 fail-safe 的区别？', a: [
        'fail-fast：迭代过程中集合结构被修改（modCount 变化）会立即抛 ConcurrentModificationException，如 ArrayList、HashMap。',
        'fail-safe：遍历的是副本或弱一致性视图，不抛异常但可能读不到最新数据，如 CopyOnWriteArrayList、ConcurrentHashMap 的迭代器。',
      ] },
      { id: 'c09', topic: 'collection', freq: 3, diff: 2, q: 'Comparable 与 Comparator 的区别？', a: [
        'Comparable 是「自然排序」，在类内部实现 compareTo，一种类型只能有一种默认排序。',
        'Comparator 是外部比较器，可以定义多套规则，配合 Lambda 与 Comparator.comparing 组合，更灵活且不侵入实体类。',
      ] },
      { id: 'c10', topic: 'collection', freq: 3, diff: 3, q: 'CopyOnWriteArrayList 的原理与适用场景？', a: [
        '写时复制：写操作加锁并复制出一份新数组，读操作无锁直接读旧数组，因此读多写少时性能很好。',
        '代价是每次写都复制整个数组、内存占用翻倍、只保证最终一致性，不适合频繁写的场景。',
      ] },
      { id: 'c11', topic: 'collection', freq: 4, diff: 2, q: '如何安全地在遍历集合时删除元素？', a: [
        '使用迭代器的 iterator.remove()，或直接用 Collection.removeIf。',
        '直接调用集合的 remove 会改变 modCount 触发 fail-fast；并发场景改用 ConcurrentHashMap 或 CopyOnWriteArrayList。',
      ] },
      { id: 'c12', topic: 'collection', freq: 3, diff: 2, q: 'ArrayDeque 与 LinkedList 作为队列或栈的区别？', a: [
        'ArrayDeque 基于循环数组，没有节点对象开销，头尾操作均摊 O(1)，是 Queue 与 Deque 的首选实现。',
        'LinkedList 每个元素都带 Node 开销且内存不连续；ArrayDeque 不允许 null，LinkedList 允许。',
      ] },
      { id: 'c13', topic: 'collection', freq: 5, diff: 5, q: 'ConcurrentHashMap 1.7 与 1.8 的实现有何区别？', a: [
        '1.7 用 Segment 分段锁加 ReentrantLock，锁粒度是段，默认 16 段，并发度受段数限制。',
        '1.8 放弃分段锁，改为 Node 数组加 CAS 插入空桶、synchronized 锁单个桶的头节点，锁粒度细化到桶。',
        '1.8 还引入红黑树、多线程协同扩容和 CounterCell 计数，并发度更高、内存开销更小。',
      ] },
      { id: 'c14', topic: 'collection', freq: 4, diff: 3, q: 'HashMap 的负载因子为什么是 0.75？扩容在什么时机触发？', a: [
        '负载因子是空间与时间的折中：0.75 时桶的冲突概率较低，又不会浪费太多空间，是官方给出的经验值。',
        '扩容时机：元素个数超过容量乘负载因子（默认 16 乘 0.75 等于 12）时扩容为两倍，并重新分布节点。',
        '也可在构造时指定容量与负载因子；调大减少扩容但冲突变多，调小冲突少但更耗内存。',
      ] },
      { id: 'c15', topic: 'collection', freq: 4, diff: 3, q: 'BlockingQueue 有哪些常见实现？各自适用什么场景？', a: [
        'ArrayBlockingQueue 基于定长数组和一把锁两个条件队列，有界、内存紧凑，适合固定吞吐的生产消费场景。',
        'LinkedBlockingQueue 基于链表，默认容量接近无界，读写用两把锁分离，吞吐高但要注意内存风险。',
        '还有 SynchronousQueue 不存储元素直接移交、PriorityBlockingQueue 按优先级出队、DelayQueue 做延时任务。',
      ] },
      { id: 'c16', topic: 'collection', freq: 3, diff: 3, q: 'PriorityQueue 的底层结构与常用操作复杂度？', a: [
        '基于二叉小顶堆的数组实现，offer 与 poll 都是 O(log n)，peek 取堆顶是 O(1)。',
        '默认按元素自然顺序，也可传入 Comparator 定制；它不是线程安全的，并发场景改用 PriorityBlockingQueue。',
        '迭代顺序不保证有序，只有 poll 才按优先级出队；容量小于 64 时翻倍，否则增长 50%。',
      ] },
      { id: 'c17', topic: 'collection', freq: 3, diff: 4, q: 'TreeMap 为什么用红黑树？如何做范围查询？', a: [
        '红黑树是自平衡二叉搜索树，插入删除后通过旋转与变色保持近似平衡，增删改查稳定 O(log n)，旋转次数比 AVL 少。',
        '范围查询用 subMap、headMap、tailMap，配合 NavigableMap 的 floorKey、ceilingKey、firstKey、lastKey 等方法。',
        'key 必须可比较（实现 Comparable 或传入 Comparator），不允许 null key；需要按 key 排序或范围检索时选它。',
      ] },
      { id: 'c18', topic: 'collection', freq: 3, diff: 2, q: 'Iterator 的原理是什么？几种遍历方式性能如何？', a: [
        'Iterator 是集合的游标：内部持有 cursor 与 expectedModCount，每次 next 前校验 modCount，不一致就抛并发修改异常。',
        'for-each 本质是编译期改写为 Iterator；ArrayList 用下标 for 最快，LinkedList 必须用 Iterator，否则 get(i) 是 O(n)。',
        'forEach 与 stream 可读性好但有 lambda 开销；普通遍历优先 for-each，需要边遍历边删除时用 iterator.remove。',
      ] },
      { id: 'c19', topic: 'collection', freq: 3, diff: 2, q: '集合的初始容量如何设置？对内存占用有什么影响？', a: [
        '按预估元素数除以 0.75 向上取整，例如存 100 个元素用 new HashMap<>(134)，可以避免中途扩容。',
        'ArrayList 用 new ArrayList<>(size) 预分配；但过大的初始容量会长期占内存，HashMap 的数组与 Node 开销尤其明显。',
        '不必过度预设：HashMap 每次扩两倍、ArrayList 扩 1.5 倍，生命周期短的小集合用默认值反而更省。',
      ] },
      { id: 'c20', topic: 'collection', freq: 4, diff: 2, q: 'Arrays.asList 和 List.of 有哪些坑？', a: [
        '两者返回的都是固定长度视图：add、remove 会抛 UnsupportedOperationException，只能改元素不能改结构。',
        'Arrays.asList 底层仍是原数组，改元素会反向影响原数组；传入基本类型数组时整个数组被当成一个元素。',
        'List.of 不可变且不允许 null，Arrays.asList 允许 null；需要可变集合时用 new ArrayList<>(Arrays.asList(...))。',
      ] },
      { id: 'c21', topic: 'collection', freq: 2, diff: 4, q: 'WeakHashMap 和 IdentityHashMap 分别有什么特点？', a: [
        'WeakHashMap 的 key 是弱引用，key 没有其他强引用时会被 GC 回收并自动移除条目，适合做缓存或附加元数据。',
        'IdentityHashMap 用 == 比较 key，即比较引用地址，并用 System.identityHashCode 定位桶。',
        'IdentityHashMap 故意违反 Map 的 equals 契约，只适合按对象身份区分的场景，如序列化框架、代理映射。',
      ] },
      { id: 'c22', topic: 'collection', freq: 4, diff: 4, q: '海量数据去重有哪些方案？如何选择？', a: [
        '内存够用就直接用 HashSet 判断，O(1) 复杂度；数据量大时用布隆过滤器，空间小但有假阳性、不支持删除。',
        '单机内存不足可以按 hash 分片到多个文件后逐个去重，或先外部排序再去重。',
        'Redis 的 Set 可跨进程去重，HyperLogLog 只估算基数有误差；整数 id 场景用 BitMap 最省内存。',
      ] },

      // ------------------------------------------------------------ 并发
      { id: 'p01', topic: 'concurrent', freq: 5, diff: 1, q: '进程与线程的区别？线程有哪些状态？', a: [
        '进程是资源分配的基本单位，线程是 CPU 调度的基本单位；同进程的线程共享堆和方法区，各自独享栈和程序计数器。',
        '状态：NEW、RUNNABLE、BLOCKED、WAITING、TIMED_WAITING、TERMINATED，其中 BLOCKED 是等锁，WAITING 是等通知。',
      ] },
      { id: 'p02', topic: 'concurrent', freq: 4, diff: 1, q: '创建线程的方式有哪些？为什么推荐线程池？', a: [
        '继承 Thread、实现 Runnable、实现 Callable 配合 FutureTask、直接使用线程池提交任务。',
        '线程的创建销毁成本高、数量不可控会 OOM；线程池复用线程、控制并发、提供任务队列与拒绝策略，还能统一监控。',
      ] },
      { id: 'p03', topic: 'concurrent', freq: 5, diff: 5, q: 'synchronized 的原理与锁升级过程？', a: [
        '修饰方法时编译为 ACC_SYNCHRONIZED，修饰代码块时编译为 monitorenter/monitorexit；底层依赖对象头的 Mark Word 与 Monitor。',
        '锁升级：无锁 → 偏向锁 → 轻量级锁（CAS 自旋）→ 重量级锁（操作系统互斥量），升级不可逆。',
      ] },
      { id: 'p04', topic: 'concurrent', freq: 5, diff: 4, q: 'volatile 的作用与原理？它能保证原子性吗？', a: [
        '保证可见性与有序性：写操作后立即刷回主存，读操作前从主存刷新，并通过内存屏障禁止指令重排。',
        '不保证原子性，i++ 这类复合操作仍需 synchronized 或 AtomicInteger；它适合做状态标志与双重检查锁的单例。',
      ] },
      { id: 'p05', topic: 'concurrent', freq: 5, diff: 5, q: 'AQS 的原理？ReentrantLock 与 synchronized 的区别？', a: [
        'AQS 用 volatile int state 表示同步状态，用 FIFO 双向队列管理阻塞线程，通过 CAS 修改 state，子类实现 tryAcquire/tryRelease。',
        'ReentrantLock 可中断、可超时、可公平、支持多个 Condition，但必须手动 unlock；synchronized 由 JVM 管理、自动释放、更简单。',
      ] },
      { id: 'p06', topic: 'concurrent', freq: 5, diff: 4, q: 'ThreadLocal 的原理？为什么会内存泄漏？', a: [
        '每个 Thread 持有一个 ThreadLocalMap，key 是 ThreadLocal 的弱引用，value 是强引用。',
        'key 被回收后 entry 仍在，value 无法通过 key 访问却不会被回收；所以使用完必须调用 remove()，尤其是线程池场景。',
      ] },
      { id: 'p07', topic: 'concurrent', freq: 5, diff: 3, q: '线程池的核心参数与执行流程？', a: [
        'corePoolSize、maximumPoolSize、keepAliveTime、unit、workQueue、threadFactory、handler。',
        '流程：核心线程未满则创建核心线程 → 否则入队 → 队列满则创建非核心线程直到上限 → 仍满则执行拒绝策略。',
      ] },
      { id: 'p08', topic: 'concurrent', freq: 5, diff: 2, q: '常见拒绝策略？为什么不建议用 Executors 创建线程池？', a: [
        'AbortPolicy（抛异常，默认）、CallerRunsPolicy（调用方线程执行）、DiscardPolicy、DiscardOldestPolicy。',
        'Executors 的 newFixedThreadPool/newSingleThreadExecutor 使用无界队列可能 OOM，newCachedThreadPool 的最大线程数是 Integer.MAX_VALUE，可能创建过多线程。',
      ] },
      { id: 'p09', topic: 'concurrent', freq: 4, diff: 4, q: 'CAS 的原理与 ABA 问题？', a: [
        'CAS 包含内存地址、期望值和新值，由 CPU 的 cmpxchg 指令保证原子性，失败则自旋重试；AtomicInteger 就建立在它之上。',
        'ABA 问题：值从 A 改成 B 又改回 A，CAS 无法察觉；用版本号解决，即 AtomicStampedReference。',
      ] },
      { id: 'p10', topic: 'concurrent', freq: 3, diff: 3, q: 'CountDownLatch、CyclicBarrier、Semaphore 的区别？', a: [
        'CountDownLatch：一个或多个线程等待其他线程完成，计数到 0 后不可重用。',
        'CyclicBarrier：一组线程互相等待，到齐后一起继续，可循环使用；Semaphore：控制同时访问共享资源的许可数量。',
      ] },
      { id: 'p11', topic: 'concurrent', freq: 4, diff: 3, q: '死锁的四个必要条件与排查方法？', a: [
        '互斥、请求与保持、不可剥夺、循环等待；破坏任意一个即可避免，工程上最常用的是按固定顺序加锁并设置超时。',
        '排查：jstack 打印线程栈，查找 “Found one Java-level deadlock” 与互相持有的锁；也可用 jconsole 或 Arthas 的 thread 命令。',
      ] },
      { id: 'p12', topic: 'concurrent', freq: 4, diff: 5, q: 'Java 内存模型与 happens-before 规则？', a: [
        'JMM 抽象出主内存与工作内存，规定线程间共享变量的可见性；volatile、synchronized、final 是建立可见性的手段。',
        '常见 happens-before：程序顺序、监视器锁解锁先于加锁、volatile 写先于读、线程 start 先于其任务、线程结束先于 join 返回、传递性。',
      ] },
      { id: 'p13', topic: 'concurrent', freq: 4, diff: 3, q: '线程中断的原理是什么？如何正确停止一个线程？', a: [
        '中断是协作机制：interrupt 只是把标志位设为 true，由目标线程自己检查后决定退出，不会强制杀死线程。',
        '阻塞中的 wait、sleep、join 会抛出 InterruptedException 并清除标志，捕获后应重新 interrupt 或直接结束，不要吞掉异常。',
        '检查用 isInterrupted 或静态 interrupted（后者会复位标志）；stop 已废弃，它不释放锁且可能留下不一致状态。',
      ] },
      { id: 'p14', topic: 'concurrent', freq: 4, diff: 2, q: 'wait/notify 与 sleep 的区别？为什么 wait 要在同步块里？', a: [
        'wait 是 Object 的方法，会释放持有的锁并进入等待队列，需要 notify/notifyAll 唤醒；sleep 是 Thread 的静态方法，只让出 CPU，不释放锁。',
        'wait 必须在 synchronized 块中调用，否则抛 IllegalMonitorStateException；只有先拿到监视器，它才能安全地释放锁。',
        'wait 可带超时，被唤醒后要重新竞争锁并从 wait 处继续；条件判断应放在 while 循环里，防止虚假唤醒。',
      ] },
      { id: 'p15', topic: 'concurrent', freq: 2, diff: 2, q: 'join 和 yield 的作用与区别？', a: [
        'join 让当前线程等待目标线程执行结束，底层是 wait/notify，带超时的重载可避免无限等待。',
        'yield 只是提示调度器让出当前 CPU，线程回到就绪态，可能立刻又被选中，既不释放锁也不保证生效。',
        '常见追问：join 期间被中断会抛 InterruptedException；yield 多用于自旋或调试，生产代码很少依赖它。',
      ] },
      { id: 'p16', topic: 'concurrent', freq: 4, diff: 3, q: '生产者消费者模型有哪些实现方式？各自优缺点是什么？', a: [
        'wait/notify 配合 synchronized：用 while 判断队列容量，notifyAll 唤醒，代码直观但容易写错且锁粒度大。',
        'BlockingQueue：put/take 自动阻塞，最常用；ArrayBlockingQueue 有界，LinkedBlockingQueue 吞吐更高但要显式设容量。',
        'Lock 加 Condition：可以分别建 notFull 与 notEmpty 两个条件队列精准唤醒，避免 notifyAll 带来的无效竞争。',
      ] },
      { id: 'p17', topic: 'concurrent', freq: 4, diff: 3, q: 'CompletableFuture 常用方法有哪些？如何编排异步任务？', a: [
        'supplyAsync/runAsync 提交任务，默认用 ForkJoinPool.commonPool，建议传入自定义线程池避免相互影响。',
        'thenApply/thenCompose 做串行转换，thenCombine 合并两个结果，allOf/anyOf 做并行聚合，thenAccept 只消费不返回。',
        '异常用 exceptionally、handle、whenComplete 处理；get 会阻塞，生产上多用回调配合 orTimeout 设置超时。',
      ] },
      { id: 'p18', topic: 'concurrent', freq: 3, diff: 4, q: 'ForkJoinPool 的原理？并行流一定更快吗？', a: [
        'ForkJoinPool 用分治加工作窃取：任务拆成子任务放入各自双端队列，空闲线程从其他队列尾部偷任务，减少竞争。',
        '并行流默认共用 commonPool，并行度是 CPU 核数减一；IO 密集或任务不均衡时收益很低，甚至比串行更慢。',
        '注意线程安全与顺序：forEach 不保证顺序，需要顺序时用 forEachOrdered；有共享可变状态时不要用并行流。',
      ] },
      { id: 'p19', topic: 'concurrent', freq: 4, diff: 4, q: 'Atomic 原子类原理？LongAdder 为何更快？', a: [
        'AtomicInteger 等基于 CAS 加 volatile value，无锁自旋更新，低竞争下性能好，高并发时大量线程空转重试。',
        'LongAdder 用分段思想：Base 加 Cell 数组，不同线程散列到不同 Cell 累加，求和时再汇总，写多读少场景吞吐更高。',
        'LongAdder 的 sum 不是原子快照，可能读到中间值；需要强一致计数或需要 CAS 语义时仍用 AtomicLong。',
      ] },
      { id: 'p20', topic: 'concurrent', freq: 3, diff: 3, q: 'ReentrantReadWriteLock 的原理与适用场景？', a: [
        '读写分离：读锁共享、写锁独占，写锁可以降级为读锁，读锁不能升级为写锁，强行升级会死锁。',
        '基于 AQS 用一个 state 的高 16 位记读锁、低 16 位记写锁；读多写少时并发度明显高于互斥锁。',
        '缺点是有写锁饥饿风险，读锁也不支持乐观读；读多写少且读操作耗时较长时可考虑 StampedLock。',
      ] },
      { id: 'p21', topic: 'concurrent', freq: 2, diff: 4, q: 'StampedLock 的原理？和读写锁相比有什么优势？', a: [
        'StampedLock 不基于 AQS，用 long 版本号 stamp 标记锁状态，支持乐观读：tryOptimisticRead 不加锁读取，再用 validate 校验。',
        '提供写锁、悲观读锁、乐观读三种模式，读多写少时吞吐明显高于 ReentrantReadWriteLock。',
        '它不可重入、不支持 Condition；validate 失败要降级为悲观读重试，且乐观读期间可能有写锁长期占用。',
      ] },
      { id: 'p22', topic: 'concurrent', freq: 3, diff: 3, q: '乐观锁与悲观锁的区别？锁消除与锁粗化是什么？', a: [
        '悲观锁假设一定冲突，先加锁再操作，如 synchronized、数据库的 select for update；乐观锁假设冲突少，用版本号或 CAS 提交时校验，失败重试。',
        '自旋锁是乐观策略的落地：线程不挂起而是循环 CAS 重试，适合临界区极短的场景，JDK 6 之后是自适应自旋。',
        '锁消除是 JIT 发现锁对象不会逃逸就直接去掉加锁；锁粗化是把相邻的多次加锁合并为一次，减少反复加解锁的开销。',
      ] },
      { id: 'p23', topic: 'concurrent', freq: 4, diff: 3, q: '双重检查锁单例为什么必须加 volatile？', a: [
        'instance = new Singleton() 分三步：分配内存、初始化对象、把引用指向内存，其中后两步可能被指令重排。',
        '若先赋值引用再初始化，另一个线程第一次判空时会看到非 null 但未初始化完成的对象，从而拿到半成品。',
        'volatile 禁止这种重排并保证可见性；更简洁的替代是静态内部类或枚举单例，天然线程安全且能防反射破坏。',
      ] },
      { id: 'p24', topic: 'concurrent', freq: 3, diff: 3, q: 'ScheduledExecutorService 如何实现定时任务？有什么坑？', a: [
        'scheduleAtFixedRate 按固定频率执行，任务超时会顺延并堆积；scheduleWithFixedDelay 是上次结束后再等固定间隔，通常更安全。',
        '任务抛异常会静默终止后续调度，所以任务体必须自己 try-catch；单线程调度器还会被慢任务整体阻塞。',
        '与 Timer 相比它支持多线程且异常不影响其他任务；分布式定时任务应交给 Quartz、XXL-JOB 等框架做分片和高可用。',
      ] },
      { id: 'p25', topic: 'concurrent', freq: 4, diff: 2, q: '线程池的核心参数应该如何设置？线上如何监控？', a: [
        'CPU 密集型设为核数加一，IO 密集型按核数乘以（1 加平均等待时间除以计算时间）估算，最终以压测结果为准。',
        '必须用有界队列并自定义线程名，配合 CallerRunsPolicy 或自定义拒绝策略做降级，避免任务无声丢失。',
        '监控活跃线程数、队列长度、完成任务数与拒绝次数，可通过 getActiveCount 等指标暴露给 Micrometer 或接入 Arthas 观察。',
      ] },
      { id: 'p26', topic: 'concurrent', freq: 3, diff: 4, q: '虚拟线程是什么？它解决了什么问题？', a: [
        'JDK 21 正式推出的轻量级线程，由 JVM 调度并挂载到少量平台线程上，阻塞时自动卸载，创建成本极低，可开到百万级。',
        '适合 IO 密集的高并发服务，让同步阻塞写法获得接近异步的吞吐；CPU 密集型任务用它没有收益。',
        '不要池化虚拟线程，避免在 synchronized 块中做长时间阻塞（会钉住载体线程），ThreadLocal 也要慎用。',
      ] },

      // ----------------------------------------------------------- JVM
      { id: 'v01', topic: 'jvm', freq: 5, diff: 2, q: 'JVM 运行时内存区域如何划分？', a: [
        '线程私有：程序计数器、虚拟机栈、本地方法栈；线程共享：堆、方法区（JDK 8 之后由元空间实现）。',
        '堆分新生代（Eden 加两个 Survivor）和老年代，是 GC 的主要区域；字符串常量池与运行时常量池在 JDK 8 后位于堆中。',
      ] },
      { id: 'v02', topic: 'jvm', freq: 4, diff: 4, q: '对象在堆中的分配过程？对象头包含什么？', a: [
        '优先在 Eden 的 TLAB 中分配 → 存活对象进入 Survivor 且年龄加 1 → 年龄达到阈值（默认 15）晋升老年代 → 超大对象直接进老年代。',
        '对象头包含 Mark Word（哈希码、GC 分代年龄、锁状态标志）与类型指针（指向方法区的类元数据）。',
      ] },
      { id: 'v03', topic: 'jvm', freq: 4, diff: 3, q: '如何判断对象可以被回收？GC Roots 有哪些？', a: [
        '引用计数无法处理循环引用，JVM 采用可达性分析：从 GC Roots 出发不可达的对象即可回收。',
        'GC Roots 包括虚拟机栈中引用的对象、方法区静态属性与常量引用的对象、本地方法栈 JNI 引用的对象、活跃线程与同步监视器持有的对象。',
      ] },
      { id: 'v04', topic: 'jvm', freq: 4, diff: 2, q: '常见的垃圾回收算法有哪些？', a: [
        '标记-清除：实现简单但产生内存碎片；复制：把存活对象复制到另一半，无碎片但浪费空间，适合新生代。',
        '标记-整理：清除后压缩，无碎片但移动对象成本高，适合老年代；现代收集器普遍采用分代收集加分区回收。',
      ] },
      { id: 'v05', topic: 'jvm', freq: 4, diff: 3, q: '常见的垃圾收集器有哪些？', a: [
        '新生代：Serial、ParNew、Parallel Scavenge；老年代：Serial Old、Parallel Old、CMS；整堆：G1、ZGC、Shenandoah。',
        'JDK 9 起 G1 成为默认收集器；ZGC 通过着色指针与读屏障把停顿控制在毫秒级，适合大堆低延迟场景。',
      ] },
      { id: 'v06', topic: 'jvm', freq: 4, diff: 3, q: '什么时候触发 Minor GC 和 Full GC？如何减少 Full GC？', a: [
        'Eden 区满触发 Minor GC；老年代空间不足、元空间不足、调用 System.gc()、晋升担保失败会触发 Full GC。',
        '减少手段：控制对象晋升速度、避免创建大对象、合理设置堆与新生代比例、排查内存泄漏、避免显式 System.gc()。',
      ] },
      { id: 'v07', topic: 'jvm', freq: 5, diff: 3, q: '类加载过程与双亲委派模型？如何打破它？', a: [
        '过程：加载 → 验证 → 准备 → 解析 → 初始化，之后才能使用和卸载。',
        '双亲委派：收到加载请求先交给父加载器，父加载器无法完成才自己加载，避免核心类被篡改。打破方式：SPI 的线程上下文类加载器、OSGi、自定义加载器重写 loadClass。',
      ] },
      { id: 'v08', topic: 'jvm', freq: 4, diff: 3, q: '内存泄漏与内存溢出的区别？如何排查 OOM？', a: [
        '泄漏是对象不再使用却仍被引用，无法回收，最终可能演变为溢出；溢出是内存确实不够用。',
        '排查：开启 -XX:+HeapDumpOnOutOfMemoryError 导出堆转储，用 MAT 或 JVisualVM 看支配树与大对象，再用 jstat 观察 GC 频率与老年代增长趋势。',
      ] },
      { id: 'v09', topic: 'jvm', freq: 3, diff: 3, q: '常用的 JVM 调优参数与工具？', a: [
        '参数：-Xms/-Xmx、-Xmn、-Xss、-XX:MetaspaceSize、-XX:+UseG1GC、-XX:MaxGCPauseMillis、-XX:+HeapDumpOnOutOfMemoryError。',
        '工具：jps、jstat、jmap、jstack、jinfo、Arthas、JProfiler、VisualVM；线上优先用 Arthas 做只读诊断。',
      ] },
      { id: 'v10', topic: 'jvm', freq: 3, diff: 4, q: '什么是逃逸分析？带来哪些优化？', a: [
        '分析对象的作用域是否逃出方法或线程；没有逃逸的对象可以做栈上分配、标量替换和锁消除。',
        '效果是减少堆分配与 GC 压力，这也是「小对象不一定都在堆上」的原因；JDK 默认开启逃逸分析。',
      ] },
      { id: 'v11', topic: 'jvm', freq: 3, diff: 2, q: '栈溢出与堆溢出有什么区别？', a: [
        'StackOverflowError：递归过深或栈帧过大导致栈空间耗尽，可通过 -Xss 调整栈大小。',
        'OutOfMemoryError: Java heap space：对象无法分配且 GC 后仍不足，需要结合堆转储定位持有链；两者都属于 Error，不应被业务代码吞掉。',
      ] },
      { id: 'v12', topic: 'jvm', freq: 3, diff: 4, q: '什么是 JIT？解释执行与编译执行是什么关系？', a: [
        'JVM 先解释执行字节码，运行期把热点代码交给 JIT 编译成本地机器码：C1 编译快、优化浅，C2 编译慢、优化深。',
        'JIT 会做方法内联、逃逸分析、去虚拟化等优化；可用 -Xint/-Xcomp 控制模式，-XX:+PrintCompilation 观察编译行为。',
      ] },
      { id: 'v13', topic: 'jvm', freq: 5, diff: 3, q: '堆内存有哪些常用参数？新生代与老年代比例怎么定？', a: [
        '-Xms 与 -Xmx 设堆的初始与最大大小，通常设成相等，避免运行期扩容收缩引起停顿抖动。',
        '新生代由 -Xmn 或 -XX:NewRatio 控制，默认约占堆三分之一，Eden 与两个 Survivor 默认 8:1:1。',
        '新生代过大挤压老年代易频繁 Full GC，过小则对象过早晋升，需结合晋升阈值与存活率调整。',
      ] },
      { id: 'v14', topic: 'jvm', freq: 3, diff: 4, q: 'TLAB 是什么？为什么它能加速对象分配？', a: [
        'TLAB 是 Eden 区内线程私有的分配缓冲，线程在自己的缓冲里用指针碰撞分配对象，不需要加锁。',
        '分配只移动 top 指针，越界后重新申请一块 TLAB，大对象则直接在 Eden 共享区或老年代分配。',
        '可用 -XX:+UseTLAB、-XX:TLABSize 调整，空间浪费率过高会触发 refill 或让线程退回共享分配。',
      ] },
      { id: 'v15', topic: 'jvm', freq: 5, diff: 4, q: 'G1 的 Region 如何划分？一次回收要经过哪些阶段？', a: [
        'G1 把堆切成大小相等的 Region（1 到 32MB），每个 Region 动态扮演 Eden、Survivor、Old 或 Humongous。',
        'Young GC 只回收新生代 Region，Mixed GC 在并发标记后额外回收部分高收益的老年代 Region。',
        '并发标记分初始标记、根区扫描、并发标记、最终标记、清理，靠 SATB 与记忆集保证不漏标。',
      ] },
      { id: 'v16', topic: 'jvm', freq: 2, diff: 5, q: 'ZGC 如何做到亚毫秒级停顿？核心机制是什么？', a: [
        'ZGC 用着色指针把标记位放进指针高位，配合读屏障在访问时修正引用，标记与整理都能并发做。',
        '它按 Region 管理并并发压缩，停顿只与根集合扫描量有关，基本不随堆大小增长，可支撑 TB 级堆。',
        '染色指针依赖多重映射把同一物理内存映射到多个虚拟地址，需 64 位平台，JDK21 起支持分代。',
      ] },
      { id: 'v17', topic: 'jvm', freq: 4, diff: 5, q: '三色标记在并发标记时会漏标吗？如何解决？', a: [
        '会漏标：黑色对象新增指向白色对象的引用，同时灰色对象到该白对象的引用被删除，白色对象就被漏掉。',
        '破坏任一条件即可：增量更新记录黑色对象的新引用，SATB 在删除前记录旧引用快照。',
        '实现靠写屏障，底层由内存屏障保证有序与可见；CMS 用增量更新，G1 用 SATB，都会留下浮动垃圾。',
      ] },
      { id: 'v18', topic: 'jvm', freq: 3, diff: 4, q: '卡表与记忆集解决什么问题？写屏障起什么作用？', a: [
        '解决跨代引用：老年代对象引用新生代对象时，不能为 Minor GC 扫描整个老年代，需要记录这些跨代引用。',
        '卡表把老年代按固定大小分卡并用字节数组标记脏卡，记忆集是更抽象的记录结构，G1 用 RSet 按 Region 记录。',
        '引用字段被赋值时由写屏障把对应卡标脏，GC 只扫描脏卡；卡表实现简单但有伪共享与扫描开销。',
      ] },
      { id: 'v19', topic: 'jvm', freq: 4, diff: 3, q: '栈帧由哪几部分组成？javap 如何查看对应字节码？', a: [
        '栈帧由局部变量表、操作数栈、动态链接、方法返回地址和附加信息组成，随方法调用入栈、返回出栈。',
        '局部变量表按槽存放参数与局部变量，long、double 占两槽，实例方法第 0 槽是 this；操作数栈是运算工作区。',
        'javap -c 可反汇编字节码，-v 还能看到栈深度、局部变量表、异常表与常量池，正好对应栈帧结构。',
      ] },
      { id: 'v20', topic: 'jvm', freq: 4, diff: 3, q: '方法区在 JDK8 前后有何变化？运行时常量池在哪？', a: [
        '方法区是规范，JDK7 及以前用永久代实现，JDK8 起改为本地内存中的元空间，运行时常量池随之迁移。',
        '永久代大小固定易 OOM 且受堆 GC 管理，元空间用本地内存可动态扩展，默认上限受机器内存约束。',
        '运行时常量池按类一份，存字面量与符号引用；字符串常量池 JDK7 起已在堆中，intern 会复用已有对象。',
      ] },
      { id: 'v21', topic: 'jvm', freq: 3, diff: 4, q: '直接内存是什么？使用它有哪些代价？', a: [
        '直接内存是堆外由操作系统管理的内存，常用 ByteBuffer.allocateDirect 或 Unsafe 分配，NIO 零拷贝依赖它。',
        '好处是少一次堆到内核的复制、不受堆大小限制；代价是分配回收昂贵，且不受 GC 直接统计与管理。',
        '默认受 -XX:MaxDirectMemorySize 限制，超限抛 OutOfMemoryError，回收靠 Cleaner 在 GC 时触发。',
      ] },
      { id: 'v22', topic: 'jvm', freq: 4, diff: 4, q: '垃圾收集器如何选型？大对象和内存碎片怎么处理？', a: [
        '选型看堆大小、停顿目标与吞吐要求：小堆用 Serial 或 Parallel，大堆低延迟用 G1、ZGC，CMS 已不推荐。',
        '大对象直接进老年代或占 Humongous Region，容易提前触发 GC，可调大 Region 或减少大数组分配。',
        'CMS 标记清除会产生碎片，需 -XX:CMSFullGCsBeforeCompaction 等参数整理，G1、ZGC 靠复制整理避免碎片。',
      ] },

      // -------------------------------------------------------- Spring
      { id: 's01', topic: 'spring', freq: 5, diff: 1, q: '什么是 IOC 与 DI？有哪些注入方式？', a: [
        'IOC 把对象的创建与依赖管理交给容器；DI 是容器把依赖注入到对象中，从而降低耦合、便于替换与测试。',
        '注入方式：构造器注入（推荐，依赖不可变、易于测试）、setter 注入、字段注入（@Autowired，简单但不推荐）。',
      ] },
      { id: 's02', topic: 'spring', freq: 5, diff: 3, q: 'Bean 的生命周期？', a: [
        '实例化 → 属性填充 → Aware 回调 → BeanPostProcessor 前置处理 → 初始化（@PostConstruct、afterPropertiesSet、init-method）→ 后置处理（AOP 代理在此生成）→ 使用 → 销毁（@PreDestroy、destroy-method）。',
      ] },
      { id: 's03', topic: 'spring', freq: 4, diff: 2, q: 'Bean 的作用域有哪些？单例 Bean 线程安全吗？', a: [
        'singleton（默认）、prototype、request、session、application、websocket。',
        '容器不保证单例 Bean 的线程安全，取决于它是否有可变状态；有状态时改用 ThreadLocal、原型作用域或加锁。',
      ] },
      { id: 's04', topic: 'spring', freq: 5, diff: 5, q: 'Spring 如何解决循环依赖？三级缓存的作用？', a: [
        '三级缓存：singletonObjects（成品）、earlySingletonObjects（半成品）、singletonFactories（对象工厂）。',
        '在实例化后提前暴露 ObjectFactory，需要时用它生成早期引用（含 AOP 代理）；构造器注入造成的循环依赖无法解决，需要 @Lazy 或重构。',
      ] },
      { id: 's05', topic: 'spring', freq: 5, diff: 4, q: 'Spring AOP 的原理？JDK 动态代理与 CGLIB 的区别？', a: [
        '运行时生成代理对象，把通知织入方法调用；切点由 AspectJ 表达式匹配，通知类型有前置、后置、环绕、异常、最终。',
        'JDK 代理基于接口，要求目标类实现接口；CGLIB 通过继承生成子类，无法代理 final 类和 final 方法。Spring Boot 2.x 默认使用 CGLIB。',
      ] },
      { id: 's06', topic: 'spring', freq: 5, diff: 3, q: '@Transactional 失效的常见场景？', a: [
        '方法不是 public、同类内部方法自调用（没有走代理）、异常被 catch 没有抛出、抛出的受检异常未配置 rollbackFor、类没有被 Spring 管理。',
        '还有：多线程调用（事务绑定在线程上）、数据库引擎不支持事务、传播行为配置为 NOT_SUPPORTED。',
      ] },
      { id: 's07', topic: 'spring', freq: 4, diff: 3, q: 'Spring 事务的传播行为有哪些？', a: [
        'REQUIRED（默认，有则加入、无则新建）、REQUIRES_NEW（总是新建并挂起当前事务）、NESTED（嵌套，基于保存点）。',
        '还有 SUPPORTS、NOT_SUPPORTED、MANDATORY、NEVER，分别对应「支持、不支持、必须、禁止」事务上下文。',
      ] },
      { id: 's08', topic: 'spring', freq: 5, diff: 4, q: 'Spring Boot 自动配置的原理？', a: [
        '@SpringBootApplication 包含 @EnableAutoConfiguration，通过 AutoConfigurationImportSelector 读取 META-INF/spring/...AutoConfiguration.imports（2.7 之前是 spring.factories）。',
        '再结合 @ConditionalOnClass、@ConditionalOnMissingBean 等条件装配；可以用 exclude 排除，或自定义 Bean 覆盖默认实现。',
      ] },
      { id: 's09', topic: 'spring', freq: 4, diff: 2, q: '@Autowired 与 @Resource 的区别？', a: [
        '@Autowired 由 Spring 提供，默认按类型注入，配合 @Qualifier 按名称；@Resource 是 JSR-250 规范，默认按名称，找不到再按类型。',
        '@Autowired 有 required 属性可以声明为非必需，@Resource 不支持这一属性。',
      ] },
      { id: 's10', topic: 'spring', freq: 4, diff: 2, q: 'Spring MVC 的请求处理流程？', a: [
        '请求进入 DispatcherServlet → HandlerMapping 找到处理器与拦截器 → HandlerAdapter 调用处理器 → 返回 ModelAndView 或 @ResponseBody 经 HttpMessageConverter 写出 → ViewResolver 渲染视图。',
        '拦截器在处理器执行前后与视图渲染后形成三个切面，异常由 HandlerExceptionResolver 统一处理。',
      ] },
      { id: 's11', topic: 'spring', freq: 3, diff: 3, q: 'BeanFactory、FactoryBean、ApplicationContext 的区别？', a: [
        'BeanFactory 是最基础的容器，默认延迟初始化；ApplicationContext 在其上增加了事件、国际化、资源加载等，默认预初始化单例。',
        'FactoryBean 是一种特殊的 Bean，用于创建复杂对象（如 SqlSessionFactory），用 getBean("&name") 可以拿到工厂本身。',
      ] },
      { id: 's12', topic: 'spring', freq: 3, diff: 2, q: '如何解决跨域问题？', a: [
        '服务端配置 CORS：@CrossOrigin 或 WebMvcConfigurer.addCorsMappings，也可以在网关统一处理。',
        '还可以用 Nginx 反向代理让前后端同源；注意携带 Cookie 时不能把 Access-Control-Allow-Origin 设为 *，必须指定具体来源。',
      ] },
      { id: 's13', topic: 'spring', freq: 4, diff: 4, q: 'Bean 工厂后置处理器与 Bean 后置处理器有什么区别？', a: [
        '前者在 Bean 实例化前修改 BeanDefinition，后者在 Bean 初始化前后对实例做增强。',
        '前者在 refresh 中解析配置类时执行，典型实现是 ConfigurationClassPostProcessor。',
        'BeanPostProcessor 有前置和后置回调，AOP 代理在 postProcessAfterInitialization 阶段生成。',
      ] },
      { id: 's14', topic: 'spring', freq: 3, diff: 4, q: '@Import 有哪些用法，条件注解是如何生效的？', a: [
        '@Import 可导入普通配置类、ImportSelector 和 ImportBeanDefinitionRegistrar 三类目标。',
        '@Conditional 由 Condition 的 matches 方法决定是否注册 Bean，Boot 据此派生出 @ConditionalOnClass 等注解。',
        '自动配置类靠 @ConditionalOnMissingBean 等按需生效，可用 debug 查看条件评估报告排查。',
      ] },
      { id: 's15', topic: 'spring', freq: 3, diff: 3, q: 'Spring 事件机制的实现原理是什么？', a: [
        '基于观察者模式，ApplicationEventPublisher 发布事件，ApplicationListener 负责监听，默认同步执行。',
        '容器生命周期会发布 ContextRefreshedEvent 等内置事件，可用于初始化数据或优雅停机。',
        '@EventListener 由 EventListenerMethodProcessor 解析注册，需要异步可加 @Async 或自定义事件广播器。',
      ] },
      { id: 's16', topic: 'spring', freq: 4, diff: 2, q: '拦截器和过滤器有什么区别？', a: [
        '过滤器属于 Servlet 规范由容器管理，拦截器属于 Spring MVC 由 HandlerMapping 装配。',
        '过滤器在 DispatcherServlet 之前执行，拦截器在 handler 调用前后执行，且能拿到 handler 方法信息。',
        '拦截器可注入 Spring Bean，适合登录与权限校验；过滤器适合编码、跨域等通用处理。',
      ] },
      { id: 's17', topic: 'spring', freq: 5, diff: 3, q: '全局异常处理和参数校验失败怎么统一处理？', a: [
        '用 @RestControllerAdvice 配合 @ExceptionHandler 统一捕获异常，校验失败会抛参数校验异常。',
        '在 DTO 字段加 @NotNull 等约束，Controller 参数加 @Valid 触发校验，再在处理器中提取 BindingResult 组装提示。',
        '可加 @ResponseStatus 或返回 ResponseEntity 控制状态码，分组校验用 groups 区分场景。',
      ] },
      { id: 's18', topic: 'spring', freq: 3, diff: 1, q: '@RestController 和 @Controller 有什么区别？', a: [
        '@Controller 默认返回视图名，方法要加 @ResponseBody 才把返回值写入响应体。',
        '@RestController 等于 @Controller 加 @ResponseBody，所有方法默认返回 JSON 数据。',
        '前后端分离项目用 @RestController，需要页面渲染时用 @Controller 配模板引擎。',
      ] },
      { id: 's19', topic: 'spring', freq: 4, diff: 5, q: 'Spring Boot 启动流程与配置文件加载顺序是怎样的？', a: [
        'SpringApplication.run 先准备 Environment 和上下文，再 prepareContext 加载主配置类并执行初始化器。',
        'refreshContext 中完成 BeanFactory 准备、后置处理器注册与单例实例化，内嵌容器在 onRefresh 阶段启动。',
        '配置优先级大致为命令行参数、环境变量、外部配置文件、jar 内配置，profile 专属文件优先于默认文件。',
      ] },
      { id: 's20', topic: 'spring', freq: 4, diff: 4, q: 'starter 的原理是什么，如何自定义一个 starter？', a: [
        'starter 是依赖聚合包，自动配置类通过 spring.factories 或 AutoConfiguration.imports 声明后由 Boot 加载。',
        '自定义时拆成 autoconfigure 和 starter 两个模块，配置类加 @ConditionalOnMissingBean 保证可覆盖。',
        '配置项用 @ConfigurationProperties 绑定，配合 @EnableConfigurationProperties 生效。',
      ] },
      { id: 's21', topic: 'spring', freq: 3, diff: 3, q: 'Spring 框架中用到了哪些设计模式？', a: [
        '工厂模式用于 BeanFactory 创建 Bean，单例模式管理 Bean 实例，模板方法体现在 refresh 流程和 JdbcTemplate。',
        '代理模式支撑 AOP，观察者模式支撑事件机制，策略模式用于实例化策略和资源加载。',
        '适配器模式见于 HandlerAdapter，责任链模式见于拦截器链和过滤器链。',
      ] },
      { id: 's22', topic: 'spring', freq: 4, diff: 4, q: '@Async 的实现原理是什么，默认线程池有什么问题？', a: [
        '@Async 由 AsyncAnnotationBeanPostProcessor 生成代理，把方法提交到 TaskExecutor 异步执行。',
        '同类内部调用不经过代理会失效，被注解方法必须是 public 且返回 void 或 Future。',
        '未配置线程池时使用 SimpleAsyncTaskExecutor 每次新建线程，生产环境应自定义 ThreadPoolTaskExecutor。',
      ] },

      // --------------------------------------------------------- MySQL
      { id: 'm01', topic: 'mysql', freq: 4, diff: 1, q: 'InnoDB 与 MyISAM 的区别？', a: [
        'InnoDB 支持事务、行级锁、外键与崩溃恢复，采用聚簇索引；MyISAM 不支持事务，只有表锁，索引与数据分离，适合只读场景。',
        'MySQL 5.5 起默认引擎为 InnoDB，新项目不应再选 MyISAM。',
      ] },
      { id: 'm02', topic: 'mysql', freq: 5, diff: 3, q: '索引为什么使用 B+ 树？', a: [
        'B+ 树层级低，通常三层就能存千万级数据，磁盘 IO 次数少；非叶子节点只存键，叶子节点存数据并用链表相连。',
        '相比 B 树，B+ 树查询路径稳定、范围扫描高效；相比哈希索引，它支持范围查询与排序。',
      ] },
      { id: 'm03', topic: 'mysql', freq: 5, diff: 4, q: '聚簇索引与非聚簇索引？什么是回表？', a: [
        'InnoDB 的主键索引就是聚簇索引，叶子节点存整行数据；二级索引的叶子节点存的是主键值。',
        '通过二级索引查询非索引列时，需要先拿到主键再回到聚簇索引取数据，即回表；把需要的列都放进索引构成覆盖索引即可避免。',
      ] },
      { id: 'm04', topic: 'mysql', freq: 5, diff: 3, q: '最左前缀原则与索引失效的常见场景？', a: [
        '联合索引 (a,b,c) 只能从最左列开始连续匹配，跳过 a 直接用 b 无法使用该索引。',
        '失效场景：对索引列做函数或运算、隐式类型转换、以 % 开头的 like、or 中存在非索引列、不符合最左前缀、部分 != 与 not in。',
      ] },
      { id: 'm05', topic: 'mysql', freq: 5, diff: 2, q: '事务的 ACID 与隔离级别？', a: [
        '原子性、一致性、隔离性、持久性，分别由 undo log、约束与逻辑、锁与 MVCC、redo log 保证。',
        '隔离级别：读未提交（脏读）、读已提交（解决脏读）、可重复读（InnoDB 默认，配合 MVCC 基本解决幻读）、串行化。',
      ] },
      { id: 'm06', topic: 'mysql', freq: 5, diff: 5, q: 'MVCC 的实现原理？', a: [
        '每行有隐藏的 DB_TRX_ID 与 DB_ROLL_PTR，undo log 把历史版本串成版本链；ReadView 记录活跃事务，按可见性规则选择读哪个版本。',
        'RC 每次查询都生成新的 ReadView，RR 在事务第一次快照读时生成并复用，因此 RR 下同一事务多次读取结果一致。',
      ] },
      { id: 'm07', topic: 'mysql', freq: 4, diff: 4, q: 'InnoDB 的锁有哪些？', a: [
        '按粒度分表锁与行锁；按模式分共享锁 S 与排他锁 X；还有意向锁、间隙锁 Gap、临键锁 Next-Key（记录锁加间隙锁，RR 下防幻读）、插入意向锁。',
        '行锁加在索引上，如果查询没有命中索引会退化为表锁，这也是「索引即锁」的由来。',
      ] },
      { id: 'm08', topic: 'mysql', freq: 4, diff: 4, q: 'redo log、undo log、binlog 的区别？', a: [
        'redo log 是 InnoDB 的物理日志，保证崩溃恢复（WAL）；undo log 是逻辑日志，用于回滚和 MVCC；binlog 是 Server 层的逻辑日志，用于主从复制与数据恢复。',
        '两阶段提交（redo prepare → 写 binlog → redo commit）保证两者一致，崩溃恢复时据此判断事务是否提交。',
      ] },
      { id: 'm09', topic: 'mysql', freq: 3, diff: 2, q: '一条 SQL 查询的执行流程？', a: [
        '连接器 → 查询缓存（8.0 已移除）→ 解析器 → 预处理器 → 优化器（选索引、生成执行计划）→ 执行器 → 存储引擎。',
        '优化器阶段决定使用哪个索引，因此索引统计信息的准确性会直接影响执行计划。',
      ] },
      { id: 'm10', topic: 'mysql', freq: 4, diff: 3, q: '如何定位与优化慢查询？', a: [
        '开启 slow_query_log，用 mysqldumpslow 或 pt-query-digest 聚合，再用 EXPLAIN 看 type、key、rows、Extra。',
        '优化方向：加合适的索引、避免 select *、用覆盖索引减少回表、拆分大 SQL、优化排序与分页，必要时做读写分离与分库分表。',
      ] },
      { id: 'm11', topic: 'mysql', freq: 3, diff: 3, q: '深分页（limit 大偏移）如何优化？', a: [
        'limit 1000000,10 需要扫描并丢弃前一百万行，代价极高。',
        '优化：用主键游标 where id > lastId order by id limit 10；或先用覆盖索引查出主键再关联取数据（延迟关联）。',
      ] },
      { id: 'm12', topic: 'mysql', freq: 3, diff: 4, q: '分库分表后跨库 JOIN 与分布式事务怎么办？', a: [
        '跨库 JOIN：冗余字段、建设宽表、拆成多次查询在应用层拼装，或把查询侧交给 ES。',
        '分布式事务：尽量让同一事务的数据落在同一分片；跨分片时用本地消息表、TCC 或 Seata 等方案保证最终一致。',
      ] },
      { id: 'm13', topic: 'mysql', freq: 5, diff: 4, q: '什么是覆盖索引与索引下推？它们如何减少回表？', a: [
        '覆盖索引指查询涉及的列全在索引里，直接从索引取数不再回表，explain 的 Extra 会显示 Using index。',
        '索引下推是 5.6 起把 where 中能用索引的列条件下推到存储引擎层先过滤，减少回表次数，Extra 显示 Using index condition。',
        '两者常配合使用：把过滤列和返回列一起放进联合索引，再让下推在引擎层筛掉不匹配的行，回表量能降到最低。',
      ] },
      { id: 'm14', topic: 'mysql', freq: 5, diff: 3, q: '联合索引的列顺序应该怎么定？', a: [
        '优先把等值条件、区分度高的列放最左，范围查询列放最后，因为范围条件会让它右边的列用不上索引。',
        '再考虑排序与分组：order by 的列顺序要与索引一致且方向相同，才能直接利用索引顺序避免额外排序。',
        '一条索引往往要服务多个查询，按最常用、最能复用的组合排序，必要时拆成多条索引，不要一味堆列。',
      ] },
      { id: 'm15', topic: 'mysql', freq: 3, diff: 3, q: '索引选择性是什么？前缀索引和唯一索引怎么选？', a: [
        '选择性等于不重复值个数除以总行数，越接近 1 区分度越高；一般低于 0.1 的列单独建索引收益很小。',
        '长字符串用前缀索引，取能保证足够区分度的最短前缀；代价是不能用于覆盖索引和排序，需评估后再用。',
        '唯一索引能保证业务唯一性且等值命中即停，但写入要校验冲突；普通索引可借助 change buffer 提升写性能。',
      ] },
      { id: 'm16', topic: 'mysql', freq: 4, diff: 2, q: '主键用自增还是 UUID？各有什么问题？', a: [
        '优先自增主键：值单调递增，新行总在 B+ 树右侧追加，页分裂少、缓存命中高，占用的空间也更小。',
        'UUID 无序且至少 16 字节，随机插入会造成频繁页分裂和索引膨胀，二级索引的叶子节点还要存更长的主键。',
        '必须用 UUID 时选有序版本（如 UUIDv7 或雪花 ID），并用二进制类型存储，减少空间浪费与页分裂。',
      ] },
      { id: 'm17', topic: 'mysql', freq: 5, diff: 5, q: '幻读是怎么产生的？InnoDB 如何解决幻读？', a: [
        '幻读是同一事务内两次相同范围查询返回的行数不同，原因是其他事务插入或删除了满足条件的行。',
        '快照读靠 MVCC 解决：RR 下事务内复用第一次读生成的 ReadView，看不到之后其他事务提交的新行。',
        '当前读靠间隙锁解决：RR 下加锁读会给范围加 next-key lock，锁住记录本身和记录间的间隙，阻止插入。',
      ] },
      { id: 'm18', topic: 'mysql', freq: 4, diff: 4, q: '死锁是怎么产生的？线上如何排查和避免？', a: [
        '两个事务以相反顺序持有并等待对方的行锁或间隙锁，形成循环等待；InnoDB 检测到后回滚代价较小的事务。',
        '排查看 show engine innodb status 的最近一次死锁段，或开 innodb_print_all_deadlocks 把死锁写进错误日志。',
        '避免按固定顺序访问数据、缩短事务、给更新条件建合适索引缩小锁范围，也可用乐观锁或降低隔离级别。',
      ] },
      { id: 'm19', topic: 'mysql', freq: 4, diff: 4, q: '主从复制的原理是什么？如何解决复制延迟？', a: [
        '主库把变更写 binlog，从库的 IO 线程拉取并写入 relay log，再由 SQL 线程回放；半同步可减少主库丢数据。',
        '延迟多因从库单线程回放跟不上主库并发写，可开并行复制按组提交或按库并行，提升回放速度。',
        '业务上让强一致读走主库、关键读等待位点追平，并监控 Seconds_Behind_Master 与 GTID 差距定位瓶颈。',
      ] },
      { id: 'm20', topic: 'mysql', freq: 4, diff: 3, q: 'count、order by、join 分别怎么优化？', a: [
        'count 直接用 count(*)，InnoDB 会选最小的二级索引扫描；只判断存在性用 limit 1，count(列) 还会排除空值。',
        'order by 尽量利用索引顺序避免 filesort；无法避免时调大 sort_buffer_size，并只查需要的列减小行宽。',
        'join 让小表驱动大表，关联列都建索引且类型一致，避免函数和隐式转换，必要时先子查询缩小驱动集。',
      ] },
      { id: 'm21', topic: 'mysql', freq: 3, diff: 4, q: '大表加字段怎么做？大事务有什么危害？', a: [
        '大表 DDL 优先用 online DDL 或 gh-ost、pt-osc 等工具，避开业务高峰，并关注元数据锁与主从延迟。',
        '大事务长时间持锁、占用连接与 undo，导致锁等待、主从延迟和回滚缓慢，应拆成小批次提交。',
        '长事务还会让 purge 无法推进、undo 表空间膨胀，并阻塞 DDL 获取元数据锁，需监控 innodb_trx 及时处理。',
      ] },
      { id: 'm22', topic: 'mysql', freq: 2, diff: 2, q: '数据库连接池该怎么配置？常见问题有哪些？', a: [
        '池大小按数据库能承受的并发定，通常为 CPU 核数的 2 到 4 倍，同时设置最大等待时间与最小空闲连接。',
        '必须配连接超时、空闲检测和最大生命周期，避免连接被数据库或中间件断开后应用还拿到失效连接。',
        '常见问题是连接泄漏与慢 SQL 占满池：开启泄漏检测、观察活跃连接数，并收窄事务边界、优化慢查询。',
      ] },

      // --------------------------------------------------------- Redis
      { id: 'r01', topic: 'redis', freq: 5, diff: 2, q: 'Redis 为什么快？是单线程还是多线程？', a: [
        '纯内存操作、单线程避免锁竞争与上下文切换、IO 多路复用（epoll）、高效的数据结构与渐进式 rehash。',
        'Redis 6.0 起网络 IO 采用多线程，但命令执行仍然是单线程，因此不需要为命令加锁。',
      ] },
      { id: 'r02', topic: 'redis', freq: 5, diff: 1, q: 'Redis 的五种基本类型与典型场景？', a: [
        'String（缓存、计数器、分布式锁）、Hash（对象存储）、List（简单队列、时间线）、Set（去重、共同好友）、ZSet（排行榜、延时队列）。',
        '另有 Bitmap、HyperLogLog、GEO、Stream 等扩展类型，分别适合签到、UV 统计、地理位置与消息流。',
      ] },
      { id: 'r03', topic: 'redis', freq: 5, diff: 3, q: '缓存穿透、击穿、雪崩的区别与解决方案？', a: [
        '穿透：查询根本不存在的数据，缓存与数据库都没有；解决：缓存空值、布隆过滤器、参数校验。',
        '击穿：热点 key 过期瞬间大量请求打到数据库；解决：互斥锁重建、逻辑过期、热点 key 不设过期。',
        '雪崩：大量 key 同时过期或 Redis 宕机；解决：过期时间加随机值、多级缓存、限流降级、集群高可用。',
      ] },
      { id: 'r04', topic: 'redis', freq: 5, diff: 4, q: '如何保证缓存与数据库的一致性？', a: [
        '常用 Cache Aside：先更新数据库，再删除缓存，并配合延迟双删或订阅 binlog 异步删除，降低并发下的脏数据窗口。',
        '强一致需要分布式锁或读写串行，代价很高；工程上一般接受最终一致，并设置合理过期时间兜底。',
      ] },
      { id: 'r05', topic: 'redis', freq: 4, diff: 2, q: 'RDB 与 AOF 的区别？', a: [
        'RDB 是快照，文件小、恢复快，但可能丢失最后一次快照之后的数据；AOF 记录写命令，实时性好，文件大、恢复慢。',
        'Redis 4.0 起支持混合持久化：RDB 存全量、AOF 存增量，兼顾恢复速度与数据安全。',
      ] },
      { id: 'r06', topic: 'redis', freq: 4, diff: 3, q: 'Redis 的过期策略与内存淘汰策略？', a: [
        '过期策略是惰性删除加定期删除：访问时才判断是否过期，同时周期性抽样删除。',
        '淘汰策略：noeviction、allkeys-lru、allkeys-lfu、allkeys-random、volatile-lru、volatile-lfu、volatile-random、volatile-ttl。',
      ] },
      { id: 'r07', topic: 'redis', freq: 4, diff: 3, q: '主从、哨兵、集群的区别？', a: [
        '主从：读写分离与数据冗余，故障需要人工切换；哨兵：监控主从并自动故障转移，提升可用性。',
        'Cluster：数据按 16384 个槽分片，支持水平扩展与自动故障转移，但跨槽的多 key 操作受限。',
      ] },
      { id: 'r08', topic: 'redis', freq: 5, diff: 4, q: 'Redis 分布式锁如何实现？有哪些坑？', a: [
        '加锁用 SET key value NX PX 30000，value 使用唯一标识；解锁用 Lua 脚本先比对 value 再删除，避免误删别人的锁。',
        '需要处理锁续期（看门狗）、业务执行超过锁过期时间、主从切换丢锁等问题；Redlock 在时钟漂移场景下存在争议。',
      ] },
      { id: 'r09', topic: 'redis', freq: 3, diff: 3, q: '如何用 Redis 实现排行榜、限流与延时队列？', a: [
        '排行榜：ZSet 的 ZADD 与 ZREVRANGE；限流：固定窗口用 INCR 加 EXPIRE，滑动窗口用 ZSet，令牌桶用 Lua 脚本。',
        '延时队列：ZSet 存到期时间戳，轮询 ZRANGEBYSCORE 取出到期任务；Stream 也支持消费组语义。',
      ] },
      { id: 'r10', topic: 'redis', freq: 4, diff: 3, q: '什么是 bigkey 和 hotkey？如何处理？', a: [
        'bigkey 是 value 过大（几 MB 的 String 或百万元素的集合），会造成网络阻塞与删除卡顿；应拆分、压缩，并用 unlink 异步删除。',
        'hotkey 是访问量极高的 key，会打满单个分片；应加本地缓存、把 key 拆分加随机后缀、读写分离。',
      ] },
      { id: 'r11', topic: 'redis', freq: 3, diff: 3, q: 'Redis 的事务与 Lua 脚本有什么区别？', a: [
        'MULTI/EXEC 事务不支持回滚，命令入队后逐条执行，某条出错其余仍会执行，也无法读取中间结果做判断。',
        'Lua 脚本在服务端原子执行，可以读写并做条件判断，是实现原子复合操作的首选；注意脚本要短，避免阻塞。',
      ] },
      { id: 'r12', topic: 'redis', freq: 2, diff: 3, q: '缓存预热与热 key 拆分怎么做？', a: [
        '预热：上线前把热点数据批量写入缓存，或通过启动钩子、定时任务提前加载，避免冷启动直接压垮数据库。',
        '热 key 拆分：把 key 复制多份加随机后缀分散到不同节点，读取时随机选一份；或增加本地缓存承担绝大部分读。',
      ] },
      { id: 'r13', topic: 'redis', freq: 5, diff: 4, q: 'Redis 的线程模型是怎样的，为什么用 IO 多路复用？', a: [
        'Redis 用单线程执行命令，配合 IO 多路复用在一个线程里监听大量连接，避免线程切换和锁竞争。',
        '6.0 起网络读写可交给 IO 线程并行处理，但命令执行仍是单线程，所以单条命令天然原子。',
        '耗时命令会阻塞整个事件循环，因此要禁用 keys、避免大 key 删除，必要时用多实例或分片。',
      ] },
      { id: 'r14', topic: 'redis', freq: 4, diff: 3, q: 'Pipeline 和批量命令有什么区别，使用时要注意什么？', a: [
        'Pipeline 把多条命令一次性发出、批量读回，主要减少网络往返，但服务端仍逐条执行，不具备原子性。',
        'mget、mset 这类批量命令由服务端一次处理，原子且省流量，但只适用于同类命令。',
        '单次 Pipeline 不宜过大，否则占用输出缓冲、阻塞其他客户端，建议按几百条分批发送。',
      ] },
      { id: 'r15', topic: 'redis', freq: 4, diff: 4, q: 'Redis 有序集合为什么用跳表而不是红黑树？', a: [
        '跳表实现简单，插入删除只改指针，平均 O(logN)，且范围查询沿底层链表顺序遍历非常高效。',
        '层数由随机函数决定，期望层数 O(logN)，省去红黑树的旋转与再平衡逻辑，代码更易维护。',
        '代价是每个节点多存层指针、内存占用更高，但换来范围查询和实现上的简单，单线程下更划算。',
      ] },
      { id: 'r16', topic: 'redis', freq: 3, diff: 4, q: '什么是渐进式 rehash，为什么需要它？', a: [
        '字典扩容时同时保留新旧两张哈希表，每次操作顺带迁移一部分桶，把一次性开销摊到多次请求上。',
        'rehash 期间查找先查旧表再查新表，新增只写新表，从而避免大字典扩容时长时间阻塞主线程。',
        '负载因子达到 1 触发扩容，收缩在因子小于 0.1 时进行，迁移完成后才释放旧表。',
      ] },
      { id: 'r17', topic: 'redis', freq: 4, diff: 5, q: '集群槽迁移怎么做，脑裂会带来什么问题？', a: [
        '槽迁移用 CLUSTER SETSLOT 配合 MIGRATE 搬 key，迁移中返回 ASK 临时重定向，完成后改为 MOVED。',
        '脑裂时旧主仍在写入、新主已接管，恢复后旧主数据被清空导致丢写，可用 min-replicas 与超时限制缓解。',
        '集群要求多数主节点可达才能写入，配合持久化和 quorum 设置可减少分裂期间的写入丢失。',
      ] },
      { id: 'r18', topic: 'redis', freq: 3, diff: 2, q: 'Redis 和 Memcached 有哪些主要区别？', a: [
        'Redis 支持字符串、哈希、列表、集合、有序集合等结构，Memcached 只有简单的 key-value。',
        'Redis 可持久化，支持主从、集群、Lua 和分布式锁；Memcached 纯内存、无持久化、无原生集群。',
        'Memcached 多线程模型在纯缓存大 value 场景吞吐更高，Redis 功能更全，常兼作缓存与数据结构服务。',
      ] },
      { id: 'r19', topic: 'redis', freq: 3, diff: 3, q: '如何优化 Redis 内存占用并估算缓存数据量？', a: [
        '先看 info memory 的 used_memory 和碎片率，用 key 数量乘以平均 key 加 value 加额外开销来估算总量。',
        '尽量使用紧凑编码：小哈希和小有序集合用 listpack、小集合用 intset，并调好对应的阈值参数。',
        '缩短 key、压缩 value、给冷数据设过期时间，再用抽样工具排查大 key 和内存分布是否异常。',
      ] },
      { id: 'r20', topic: 'redis', freq: 3, diff: 3, q: '慢查询日志怎么用，连接池和序列化要注意什么？', a: [
        '用 slowlog-log-slower-than 设阈值，slowlog get 查看命令、耗时和来源，重点优化 O(N) 类命令。',
        '日常监控 connected_clients、used_memory、命中率、每秒命令数和延迟，异常时结合监控定位瓶颈。',
        '连接池要限制最大连接、设置获取超时和心跳；序列化优先紧凑二进制格式，避免大对象并注意版本兼容。',
      ] },

      // ---------------------------------------------------------- 消息队列
      { id: 'q01', topic: 'mq', freq: 5, diff: 1, q: '为什么要使用消息队列？会带来什么问题？', a: [
        '三大价值：解耦、异步、削峰填谷。',
        '代价：系统可用性下降（MQ 挂了链路就断）、复杂度上升、数据一致性需要额外保证，还会遇到重复消费与顺序问题。',
      ] },
      { id: 'q02', topic: 'mq', freq: 4, diff: 2, q: 'Kafka、RocketMQ、RabbitMQ 如何选型？', a: [
        'Kafka 吞吐最高，适合日志、埋点等大数据流场景，生态成熟。',
        'RocketMQ 的事务消息、顺序消息、延时消息较完善，适合电商交易；RabbitMQ 路由灵活、延迟低，适合业务解耦与中小规模场景。',
      ] },
      { id: 'q03', topic: 'mq', freq: 5, diff: 3, q: '如何保证消息不丢失？', a: [
        '生产端：同步发送加重试，Kafka 设置 acks=all；Broker：多副本并设置最小同步副本数，必要时同步刷盘。',
        '消费端：关闭自动提交，业务处理成功后再手动提交 offset；配合死信队列兜底。',
      ] },
      { id: 'q04', topic: 'mq', freq: 5, diff: 3, q: '如何保证消息不被重复消费？', a: [
        '消息是「至少一次」投递，重复无法避免，必须由消费端保证幂等。',
        '方案：业务唯一键加数据库唯一索引、去重表、用 Redis setnx 记录消息 id、状态机只允许特定状态流转。',
      ] },
      { id: 'q05', topic: 'mq', freq: 4, diff: 3, q: '如何保证消息的顺序性？', a: [
        '核心是同一业务 key 落到同一分区或队列，并且该分区只被单线程消费。',
        'Kafka 用消息 key 指定分区；RocketMQ 用 MessageQueueSelector；RabbitMQ 用单队列加单消费者。全局顺序代价极高，通常只保证局部顺序。',
      ] },
      { id: 'q06', topic: 'mq', freq: 4, diff: 3, q: '消息积压如何处理？', a: [
        '先定位原因：是消费变慢还是生产突增。临时扩容消费者、增加分区并同步扩容消费线程。',
        '极端情况可以临时写一个消费者把消息转存到临时队列或数据库，先恢复线上，事后慢慢补偿。',
      ] },
      { id: 'q07', topic: 'mq', freq: 4, diff: 4, q: 'Kafka 为什么吞吐高？', a: [
        '顺序写磁盘配合页缓存、零拷贝（sendfile）、批量发送与压缩、分区并行读写、稀疏索引。',
        '这些设计把随机 IO 变成顺序 IO，并把多次小 IO 合并成一次大 IO。',
      ] },
      { id: 'q08', topic: 'mq', freq: 4, diff: 4, q: 'Kafka 的 ISR、acks、HW、LEO 分别是什么？', a: [
        'ISR 是与 leader 保持同步的副本集合；acks=0/1/all 控制生产端的确认级别。',
        'LEO 是每个副本日志的末端偏移；HW 是 ISR 中最小的 LEO，消费者只能读到 HW 之前的消息。',
      ] },
      { id: 'q09', topic: 'mq', freq: 3, diff: 3, q: '延迟消息如何实现？', a: [
        'RocketMQ 内置延迟级别（固定档位）；RabbitMQ 用死信队列加 TTL 或延迟插件。',
        'Kafka 需要自建时间轮或外部调度；也可以用 Redis ZSet 存到期时间戳，由定时任务扫描。',
      ] },
      { id: 'q10', topic: 'mq', freq: 3, diff: 4, q: '事务消息的原理？', a: [
        '先发送对消费者不可见的半消息 → 执行本地事务 → 根据结果提交或回滚 → 若长时间未确认，Broker 定时回查本地事务状态。',
        '它保证本地事务与消息发送的最终一致，是「本地消息表」思路的中间件化实现。',
      ] },
      { id: 'q11', topic: 'mq', freq: 3, diff: 2, q: '死信队列的作用？', a: [
        '存放无法正常消费的消息：重试超过上限、被消费者拒绝、过期未处理。',
        '作用是把「处理不了的消息」隔离出来，既不丢失也不阻塞正常队列，便于人工排查与补偿。',
      ] },
      { id: 'q12', topic: 'mq', freq: 4, diff: 4, q: '如何设计消息的可靠投递与补偿？', a: [
        '本地消息表：业务数据与消息记录写在同一个本地事务里，再由定时任务投递并更新状态，失败重试。',
        '消费端记录处理日志，失败重试并设置上限，超限进入死信队列告警；再配合定时对账兜底。',
      ] },
      { id: 'q13', topic: 'mq', freq: 5, diff: 4, q: 'Kafka 的分区与副本机制是怎样的？', a: [
        '分区是并行与有序的最小单位：分区内消息有序，分区数决定消费并行度；每个分区有多个副本，一主多从，只有 leader 对外读写。',
        '副本分散在不同 broker 上，leader 挂掉后从 ISR 中选出新 leader；分区数只能增加不能减少，扩分区会改变 key 的落点，可能破坏顺序性。',
        '常见追问是分区越多越好吗：不是，分区过多会带来文件句柄、leader 选举和 rebalance 开销，一般按目标吞吐和消费者数量评估。',
      ] },
      { id: 'q14', topic: 'mq', freq: 5, diff: 3, q: '消费者组是什么？rebalance 的过程与问题？', a: [
        '消费者组内每个分区同一时刻只被一个消费者消费，从而实现消费端并行与负载均衡；不同消费者组互不影响，相当于各自订阅一份。',
        '触发条件是消费者增减、分区数变化、订阅变化。由 coordinator 选出 leader 消费者，再按 range、round-robin 或 sticky 策略分配分区。',
        'rebalance 期间整个组暂停消费，容易造成重复消费和延迟抖动，所以要避免频繁扩缩容，也可以用 cooperative sticky 减少影响。',
      ] },
      { id: 'q15', topic: 'mq', freq: 4, diff: 2, q: 'Kafka 的 offset 有哪几种提交方式？', a: [
        '分自动提交和手动提交。自动提交由消费端定时批量提交，写法简单，但可能在业务处理完成前就提交，进程崩溃时消息就丢了。',
        '手动提交分同步 commitSync 和异步 commitAsync：同步可靠但阻塞，异步吞吐高但失败不会自动重试，常见做法是异步为主、关闭前同步兜底。',
        '更可靠的做法是把 offset 和业务结果放进同一个本地事务，或用幂等加去重表，做到业务处理成功后才提交。',
      ] },
      { id: 'q16', topic: 'mq', freq: 4, diff: 3, q: 'RocketMQ 的架构由哪些部分组成？', a: [
        '四个核心角色：NameServer 负责路由注册与发现，Broker 负责消息存储与收发，Producer 生产消息，Consumer 消费消息。',
        'NameServer 节点之间互不通信，各自保存全量路由，Broker 定时向所有 NameServer 心跳上报，因此 NameServer 无状态、可随意扩容。',
        'Broker 分 master 和 slave：master 承担读写，slave 同步备份，master 宕机后由 slave 接管；配合 DLedger 还能实现自动选主。',
      ] },

      // ----------------------------------------------------------- 分布式
      { id: 'd01', topic: 'distributed', freq: 5, diff: 2, q: 'CAP 与 BASE 理论？', a: [
        'CAP：一致性、可用性、分区容错性三者不可兼得；分布式系统必须容忍网络分区，因此只能在 C 与 A 之间取舍。',
        'BASE：基本可用、软状态、最终一致，是 AP 方向的工程实践，也是大多数互联网系统的选择。',
      ] },
      { id: 'd02', topic: 'distributed', freq: 5, diff: 4, q: '分布式事务有哪些方案？', a: [
        '2PC/XA 强一致但性能差；TCC 业务侵入大，需要处理幂等、悬挂与空回滚；Saga 用补偿处理长事务。',
        '最终一致方案：本地消息表、事务消息、Seata AT 的自动补偿；选择取决于一致性要求与对业务侵入的容忍度。',
      ] },
      { id: 'd03', topic: 'distributed', freq: 4, diff: 3, q: '分布式 ID 的生成方案有哪些？', a: [
        'UUID 无序且太长，不适合做主键；数据库自增或号段模式简单但有单点；Redis INCR 性能好但依赖可用性。',
        '雪花算法 Snowflake：时间戳 + 机器号 + 序列号，趋势递增、性能高，需要处理时钟回拨；Leaf 等方案在其上做了改进。',
      ] },
      { id: 'd04', topic: 'distributed', freq: 4, diff: 3, q: '服务注册与发现的原理？Nacos 与 Eureka 的区别？', a: [
        '服务启动时注册到注册中心，消费者拉取或订阅服务列表并做负载均衡调用；注册中心通过心跳或长连接做健康检查。',
        'Nacos 支持 AP/CP 切换、配置中心与推送式更新；Eureka 是 AP 模型，只做注册发现，客户端拉取存在延迟。',
      ] },
      { id: 'd05', topic: 'distributed', freq: 4, diff: 3, q: '常见的限流算法有哪些？', a: [
        '固定窗口（简单但有临界突刺）、滑动窗口（平滑）、漏桶（恒定速率）、令牌桶（允许一定突发）。',
        '实现可用 Guava RateLimiter、Sentinel、Redis 加 Lua 脚本，或在网关层统一限流。',
      ] },
      { id: 'd06', topic: 'distributed', freq: 4, diff: 3, q: '熔断、降级、隔离的区别？', a: [
        '熔断：下游错误率超过阈值时快速失败，避免雪崩，常见实现是 Sentinel 与 Resilience4j。',
        '降级：返回兜底数据或默认值；隔离：用线程池或信号量隔离不同依赖，防止一个慢依赖拖垮整个服务。',
      ] },
      { id: 'd07', topic: 'distributed', freq: 3, diff: 2, q: '常见的负载均衡算法？', a: [
        '轮询、加权轮询、随机、加权随机、最少连接、一致性哈希、源地址哈希。',
        '分为客户端负载均衡（Ribbon、Spring Cloud LoadBalancer）与服务端负载均衡（Nginx、LVS）。',
      ] },
      { id: 'd08', topic: 'distributed', freq: 5, diff: 3, q: '分布式锁有哪些实现？如何对比？', a: [
        'Redis：性能高，但要处理续期与主从切换丢锁；ZooKeeper：临时顺序节点、强一致，但性能较低。',
        '数据库：唯一索引或 select for update，实现简单但性能差；选择取决于对一致性、性能与复杂度的权衡。',
      ] },
      { id: 'd09', topic: 'distributed', freq: 3, diff: 4, q: '一致性哈希的原理与应用？', a: [
        '把节点与数据都映射到 2^32 的环上，数据顺时针找到第一个节点；增删节点只影响相邻区间。',
        '用虚拟节点解决数据倾斜；应用在缓存分片、RPC 负载均衡、分库分表路由等场景。',
      ] },
      { id: 'd10', topic: 'distributed', freq: 5, diff: 3, q: '如何保证接口幂等性？', a: [
        '唯一索引、token 机制（先取 token，提交时校验并删除）、状态机只允许特定状态流转。',
        '还可以用乐观锁版本号、分布式锁加请求去重表；关键是让重复请求产生与一次请求相同的结果。',
      ] },
      { id: 'd11', topic: 'distributed', freq: 3, diff: 3, q: '微服务如何拆分？常见问题有哪些？', a: [
        '按业务能力与 DDD 限界上下文拆分，做到单一职责、高内聚低耦合、数据库独立。',
        '问题：分布式事务、调用链变长导致延迟、服务治理复杂、数据一致性、测试与运维成本上升。',
      ] },
      { id: 'd12', topic: 'distributed', freq: 3, diff: 3, q: '链路追踪的原理？', a: [
        '请求入口生成 TraceId，跨服务调用时透传并生成 SpanId，形成调用树。',
        '各服务把数据上报到收集端（Jaeger、Zipkin、SkyWalking）做存储与可视化，用于定位慢调用与异常链路。',
      ] },
      { id: 'd13', topic: 'distributed', freq: 5, diff: 4, q: '什么是服务雪崩，超时和重试该怎么配合？', a: [
        '服务雪崩是某个下游变慢或挂掉，导致调用方线程堆积、资源耗尽，逐级拖垮整条链路。',
        '超时时间要按依赖的 P99 设置并逐层收敛，重试只对幂等或读请求开启，次数控制在 1 到 2 次。',
        '重试要加退避和随机抖动，并配合熔断、舱壁隔离和限流，避免重试风暴把流量放大数倍。',
      ] },
      { id: 'd14', topic: 'distributed', freq: 4, diff: 3, q: '灰度发布怎么做，如何保证出问题能快速回滚？', a: [
        '灰度是按用户、流量比例或实例分组小范围放量，验证通过再逐步扩大，异常时立即切回旧版本。',
        '常见方式有网关按比例或标签路由、注册中心权重调整、容器副本分批替换，配合功能开关使用。',
        '必须监控核心指标并设自动回滚阈值，同时保证新旧版本接口与数据结构兼容，否则回滚也救不回来。',
      ] },
      { id: 'd15', topic: 'distributed', freq: 4, diff: 3, q: '配置中心的作用是什么，配置如何动态生效？', a: [
        '配置中心集中管理各环境配置，支持灰度、版本回滚、变更审计和权限控制，避免配置散落在各机器上。',
        '客户端启动时拉取全量并注册监听，服务端变更后通过长轮询或推送通知，客户端更新本地缓存。',
        '要注意变更的幂等和失败兜底，本地保留快照，配置中心不可用时服务仍能用旧配置启动。',
      ] },
      { id: 'd16', topic: 'distributed', freq: 5, diff: 2, q: 'API 网关在微服务架构中承担哪些职责？', a: [
        '网关是所有外部流量的统一入口，负责路由转发、鉴权、限流、熔断、日志和协议转换。',
        '它把鉴权、跨域、灰度、监控等横切逻辑从业务服务中抽出来，让服务只关注自身业务。',
        '网关自身要无状态多副本部署，避免成为单点和性能瓶颈，路由规则可放配置中心动态下发。',
      ] },
      { id: 'd17', topic: 'distributed', freq: 5, diff: 4, q: 'RPC 的调用过程是怎样的，核心要解决什么？', a: [
        '客户端用动态代理把方法调用封装成请求，序列化后经网络发给服务端，服务端反序列化后反射调用并回传结果。',
        '核心要解决协议编解码、连接管理、服务发现、负载均衡、超时重试和异常传递。',
        '常见框架有 Dubbo、gRPC、Thrift，gRPC 基于 HTTP2 和 Protobuf，跨语言能力更好。',
      ] },
      { id: 'd18', topic: 'distributed', freq: 4, diff: 4, q: 'Dubbo 的架构包含哪些角色，一次调用怎么走？', a: [
        'Dubbo 有提供者、消费者、注册中心、监控中心和配置中心五个角色，注册中心负责地址注册与订阅。',
        '消费者启动时订阅并缓存提供者列表，调用时经集群容错、负载均衡、过滤器链后发起远程调用。',
        '默认 dubbo 协议走单一长连接和 NIO 异步传输，适合小数据量高并发，大文件应换其他协议。',
      ] },
      { id: 'd19', topic: 'distributed', freq: 3, diff: 3, q: '分布式环境下会话共享有哪些实现方案？', a: [
        '最常用的是把会话集中存到 Redis，各节点按 sessionId 读写，服务本身保持无状态。',
        '也可以用 token 或 JWT 把状态放到客户端，服务端只校验签名，但难以主动失效和续期。',
        '粘性会话靠网关按 sessionId 固定路由，扩容和故障转移体验差，一般不推荐。',
      ] },
      { id: 'd20', topic: 'distributed', freq: 3, diff: 4, q: '分布式任务调度如何保证任务只被一台机器执行？', a: [
        '调度中心统一分配任务，执行器通过抢锁或选主保证同一时刻只有一个节点真正执行。',
        '常用框架有 XXL-JOB、Elastic-Job、Quartz 集群，靠数据库行锁或 ZooKeeper 临时节点协调。',
        '还要考虑任务分片、失败重试、执行日志和幂等，节点宕机后由调度中心重新分配。',
      ] },
      { id: 'd21', topic: 'distributed', freq: 5, diff: 4, q: '分布式缓存的常见问题有哪些，分别怎么解决？', a: [
        '主要有缓存穿透、击穿、雪崩，以及缓存与数据库的一致性问题。',
        '穿透用布隆过滤器或缓存空值，击穿用互斥锁或逻辑过期，雪崩靠过期时间打散、多级缓存和熔断。',
        '一致性上一般先更新数据库再删缓存，配合延迟双删或订阅 binlog 异步失效。',
      ] },
      { id: 'd22', topic: 'distributed', freq: 5, diff: 4, q: '实现最终一致性有哪些常见手段？', a: [
        '常见有本地消息表、事务消息、可靠消息投递加消费重试、TCC 以及定时对账补偿。',
        '核心是把本地业务和消息发送放进同一个本地事务，保证消息一定发出，消费端幂等重试直到成功。',
        '最后用对账和补偿任务兜底修正长时间不一致的数据，并对积压和失败做监控告警。',
      ] },
      { id: 'd23', topic: 'distributed', freq: 4, diff: 5, q: '分布式锁为什么要续期，Redisson 是怎么做的？', a: [
        '锁的过期时间很难估准，业务没执行完锁就过期，其他线程会进入临界区导致并发问题。',
        'Redisson 用看门狗机制，加锁成功后启动定时任务，每三分之一过期时间续期一次，直到主动解锁。',
        '续期只在持锁线程存活时有效，宕机就停止续期让锁自然过期，从而避免死锁。',
      ] },
      { id: 'd24', topic: 'distributed', freq: 4, diff: 3, q: '如何用消息队列实现最终一致性？', a: [
        '业务成功后发送消息，下游消费并重试，把跨服务事务拆成若干异步步骤，最终达到一致。',
        '关键是本地事务与发消息的原子性，可用本地消息表或 RocketMQ 事务消息，消费端必须幂等。',
        '还要处理消息丢失、重复和顺序问题，配合死信队列、对账补偿和监控告警。',
      ] },
    ];

    const QUESTION_BY_ID = new Map(BANK.map((item) => [item.id, item]));
    /** Built-in ids, used to reject imports that would shadow a shipped question. */
    const BUILTIN_IDS = new Set(BANK.map((item) => item.id));

    // -------------------------------------------------------------- copy
    const zh = {
      'nav.label': 'Java 面试题',
      'page.title': 'Java 高频面试题',
      'page.desc': '按板块刷题，每题都带要点解析；收藏想反复看的题，每次练 10 道，随时换一批。',
      'page.back': '返回对话',
      'page.rangeUnit': '题',
      'tab.all': '全部',
      'tab.fav': '我的收藏',
      'action.next': '换一批',
      'action.reveal': '看答案',
      'action.hide': '收起答案',
      'action.favorite': '收藏',
      'action.unfavorite': '已收藏',
      'score.freq': '面试频率',
      'score.diff': '难度',
      'sort.label': '排序',
      'sort.random': '随机',
      'sort.freq-desc': '频率高→低',
      'sort.diff-desc': '难度高→低',
      'sort.diff-asc': '难度低→高',
      'import.open': '导入题库',
      'import.clear': '清空导入',
      'import.title': '导入题库',
      'import.close': '关闭',
      'import.cancel': '取消',
      'import.submit': '校验并导入',
      'import.hint': '粘贴 JSON 数组，每条题目一个对象。导入的题目会合并进现有题库，可随时清空。',
      'import.rule1': '必填 topic，取值只能是：basic、collection、concurrent、jvm、spring、mysql、redis、mq、distributed。',
      'import.rule2': '必填 q（题干，≤120 字）；必填 a（要点数组，1–5 条，每条 ≤300 字）。',
      'import.rule3': 'freq 与 diff 可省略，省略时按 3 颗心处理；填写则必须是 1–5 的整数。',
      'import.rule4': 'id 可省略（自动生成）；与内置题或已导入题重复的 id 会被跳过，不会覆盖原有题目。',
      'import.rule5': '也可以选择本地 .json 文件，读入后仍会按上述规则校验，文件大小上限 2 MB。',
      'import.pick': '选择文件',
      'import.pickHint': '未选择文件，或直接粘贴到下方文本框',
      'import.err.fileTooLarge': '文件超过大小上限',
      'import.err.fileRead': '文件读取失败，请确认是 UTF-8 编码的文本文件。',
      'import.placeholder': '[{"topic":"basic","freq":5,"diff":2,"q":"题干？","a":["要点一","要点二"]}]',
      'import.row': '第',
      'import.done': '导入成功：新增',
      'import.skipped': '跳过重复',
      'import.err.parse': 'JSON 解析失败，请检查括号、引号和逗号。',
      'import.err.notObject': '顶层必须是数组，或包含 questions 数组的对象。',
      'import.err.notArray': '顶层必须是数组，或包含 questions 数组的对象。',
      'import.err.empty': '数组为空，至少需要一道题。',
      'import.err.tooMany': '题目数量超过上限',
      'import.err.rowNotObject': '这一项不是对象。',
      'import.err.badTopic': 'topic 不在允许的板块列表内。',
      'import.err.missingQuestion': '缺少题干 q。',
      'import.err.questionTooLong': '题干过长，上限',
      'import.err.answersNotArray': 'a 必须是字符串数组。',
      'import.err.missingAnswer': '缺少答案要点 a，或要点全为空。',
      'import.err.tooManyPoints': '答案要点过多，上限',
      'import.err.pointTooLong': '答案要点过长，上限',
      'import.err.badFreq': 'freq 必须是 1–5 的整数。',
      'import.err.badDiff': 'diff 必须是 1–5 的整数。',
      'empty.fav': '收藏夹还是空的。刷题时点右侧的「收藏」，题目就会出现在这里。',
      'empty.pool': '这个板块暂时没有题目。',
      'topic.basic': 'Java 基础',
      'topic.collection': '集合框架',
      'topic.concurrent': '并发编程',
      'topic.jvm': 'JVM',
      'topic.spring': 'Spring',
      'topic.mysql': 'MySQL',
      'topic.redis': 'Redis',
      'topic.mq': '消息队列',
      'topic.distributed': '分布式',
    };

    const en = {
      'nav.label': 'Java Interview',
      'page.title': 'Java Interview Practice',
      'page.desc': 'Drill high-frequency Java interview questions by topic, each with key points. Star the ones to revisit, practise ten at a time, and refresh the batch anytime.',
      'page.back': 'Back to chat',
      'page.rangeUnit': 'questions',
      'tab.all': 'All',
      'tab.fav': 'Favorites',
      'action.next': 'New batch',
      'action.reveal': 'Show answer',
      'action.hide': 'Hide answer',
      'action.favorite': 'Star',
      'action.unfavorite': 'Starred',
      'score.freq': 'Frequency',
      'score.diff': 'Difficulty',
      'sort.label': 'Sort',
      'sort.random': 'Shuffled',
      'sort.freq-desc': 'Frequency ↓',
      'sort.diff-desc': 'Hardest first',
      'sort.diff-asc': 'Easiest first',
      'import.open': 'Import bank',
      'import.clear': 'Clear imported',
      'import.title': 'Import questions',
      'import.close': 'Close',
      'import.cancel': 'Cancel',
      'import.submit': 'Validate & import',
      'import.hint': 'Paste a JSON array with one object per question. Imported questions merge into the bank and can be cleared anytime.',
      'import.rule1': 'topic is required and must be one of: basic, collection, concurrent, jvm, spring, mysql, redis, mq, distributed.',
      'import.rule2': 'q is required (≤120 chars); a is required (1–5 points, each ≤300 chars).',
      'import.rule3': 'freq and diff are optional and default to 3; when present they must be integers from 1 to 5.',
      'import.rule4': 'id is optional (generated when absent); ids clashing with a built-in or imported question are skipped, never overwritten.',
      'import.rule5': 'You can also pick a local .json file; it is still validated against every rule above. Size limit 2 MB.',
      'import.pick': 'Choose file',
      'import.pickHint': 'No file chosen, or paste directly below',
      'import.err.fileTooLarge': 'The file exceeds the size limit of',
      'import.err.fileRead': 'Could not read the file. Make sure it is UTF-8 encoded text.',
      'import.placeholder': '[{"topic":"basic","freq":5,"diff":2,"q":"Question?","a":["Point one","Point two"]}]',
      'import.row': 'Row',
      'import.done': 'Imported: added',
      'import.skipped': 'skipped duplicates',
      'import.err.parse': 'Invalid JSON. Check brackets, quotes and commas.',
      'import.err.notObject': 'The top level must be an array, or an object with a questions array.',
      'import.err.notArray': 'The top level must be an array, or an object with a questions array.',
      'import.err.empty': 'The array is empty; add at least one question.',
      'import.err.tooMany': 'Too many questions; limit is',
      'import.err.rowNotObject': 'This entry is not an object.',
      'import.err.badTopic': 'topic is not one of the allowed topics.',
      'import.err.missingQuestion': 'Missing the question text (q).',
      'import.err.questionTooLong': 'Question text is too long; limit is',
      'import.err.answersNotArray': 'a must be an array of strings.',
      'import.err.missingAnswer': 'Missing answer points (a), or all points are blank.',
      'import.err.tooManyPoints': 'Too many answer points; limit is',
      'import.err.pointTooLong': 'An answer point is too long; limit is',
      'import.err.badFreq': 'freq must be an integer from 1 to 5.',
      'import.err.badDiff': 'diff must be an integer from 1 to 5.',
      'empty.fav': 'No favorites yet. Use Star on a question while practising and it will show up here.',
      'empty.pool': 'This topic has no questions yet.',
      'topic.basic': 'Java Basics',
      'topic.collection': 'Collections',
      'topic.concurrent': 'Concurrency',
      'topic.jvm': 'JVM',
      'topic.spring': 'Spring',
      'topic.mysql': 'MySQL',
      'topic.redis': 'Redis',
      'topic.mq': 'Messaging',
      'topic.distributed': 'Distributed',
    };

    // ----------------------------------------------------------- helpers
    function shuffle(list) {
      const next = list.slice();
      for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const swap = next[i];
        next[i] = next[j];
        next[j] = swap;
      }
      return next;
    }

    /**
     * Ordering modes. `random` keeps the shuffled drill feel; the other three
     * rank the pool so the hardest or the most-asked questions come first.
     */
    const SORTS = ['random', 'freq-desc', 'diff-desc', 'diff-asc'];

    /** Build the id order for a pool under one of `SORTS`. */
    function buildOrder(pool, sortBy) {
      if (sortBy === 'random') return shuffle(pool.map((item) => item.id));
      const items = pool.slice();
      if (sortBy === 'freq-desc') {
        items.sort((a, b) => b.freq - a.freq || b.diff - a.diff || (a.id < b.id ? -1 : 1));
      } else if (sortBy === 'diff-desc') {
        items.sort((a, b) => b.diff - a.diff || b.freq - a.freq || (a.id < b.id ? -1 : 1));
      } else if (sortBy === 'diff-asc') {
        items.sort((a, b) => a.diff - b.diff || b.freq - a.freq || (a.id < b.id ? -1 : 1));
      }
      return items.map((item) => item.id);
    }

    /**
     * Import rules. Everything the dialog promises about a bank file is
     * enforced here, so a paste that passes validation is safe to render.
     */
    const IMPORT_RULES = {
      maxQuestions: 500,
      maxQuestionLength: 120,
      maxPoints: 5,
      maxPointLength: 300,
      /** A 2 MB ceiling keeps a stray binary or dump from locking the page. */
      maxFileBytes: 2 * 1024 * 1024,
    };

    const TOPIC_IDS = TOPICS.map((topic) => topic.id);

    /**
     * Validate one parsed bank payload.
     *
     * Accepts either a bare array or `{ questions: [...] }`. Every question is
     * checked; the result reports per-item errors keyed by its position so the
     * dialog can point at the exact row instead of failing vaguely.
     */
    function validateImport(raw) {
      const errors = [];
      const questions = [];

      if (raw === null || typeof raw !== 'object') {
        return { ok: false, errors: [{ index: -1, message: 'notObject' }], questions: [] };
      }

      let rows = raw;
      if (!Array.isArray(raw)) {
        if (Array.isArray(raw.questions)) rows = raw.questions;
        else return { ok: false, errors: [{ index: -1, message: 'notArray' }], questions: [] };
      }

      if (rows.length === 0) return { ok: false, errors: [{ index: -1, message: 'empty' }], questions: [] };
      if (rows.length > IMPORT_RULES.maxQuestions) {
        return { ok: false, errors: [{ index: -1, message: 'tooMany', limit: IMPORT_RULES.maxQuestions }], questions: [] };
      }

      rows.forEach((row, index) => {
        const push = (message, extra) => errors.push(Object.assign({ index, message }, extra || {}));

        if (row === null || typeof row !== 'object' || Array.isArray(row)) {
          push('rowNotObject');
          return;
        }

        const topic = typeof row.topic === 'string' ? row.topic.trim() : '';
        if (!TOPIC_IDS.includes(topic)) { push('badTopic', { value: String(row.topic) }); return; }

        const text = typeof row.q === 'string' ? row.q.trim() : '';
        if (text === '') { push('missingQuestion'); return; }
        if (text.length > IMPORT_RULES.maxQuestionLength) {
          push('questionTooLong', { limit: IMPORT_RULES.maxQuestionLength });
          return;
        }

        if (!Array.isArray(row.a)) { push('answersNotArray'); return; }
        const points = row.a
          .map((point) => (typeof point === 'string' ? point.trim() : ''))
          .filter((point) => point !== '');
        if (points.length === 0) { push('missingAnswer'); return; }
        if (points.length > IMPORT_RULES.maxPoints) { push('tooManyPoints', { limit: IMPORT_RULES.maxPoints }); return; }
        if (points.some((point) => point.length > IMPORT_RULES.maxPointLength)) {
          push('pointTooLong', { limit: IMPORT_RULES.maxPointLength });
          return;
        }

        const rating = (value) => {
          if (value === undefined || value === null) return null;
          const num = Number(value);
          return Number.isInteger(num) && num >= 1 && num <= 5 ? num : NaN;
        };
        const freq = rating(row.freq);
        const diff = rating(row.diff);
        if (Number.isNaN(freq)) { push('badFreq'); return; }
        if (Number.isNaN(diff)) { push('badDiff'); return; }

        questions.push({
          id: typeof row.id === 'string' && row.id.trim() !== '' ? row.id.trim() : 'imp-' + (index + 1),
          topic,
          freq: freq === null ? 3 : freq,
          diff: diff === null ? 3 : diff,
          q: text,
          a: points,
        });
      });

      return { ok: errors.length === 0, errors, questions: errors.length === 0 ? questions : [] };
    }

    function loadFavorites() {
      try {
        const raw = window.localStorage.getItem(FAV_KEY);
        if (raw === null) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((id) => typeof id === 'string' && QUESTION_BY_ID.has(id));
      } catch (error) {
        return [];
      }
    }

    function saveFavorites(ids) {
      try {
        window.localStorage.setItem(FAV_KEY, JSON.stringify(ids));
      } catch (error) {
        /* A full or blocked storage must not break the practice page. */
      }
    }

    /** Read the imported questions, dropping anything that no longer validates. */
    function loadImported() {
      try {
        const raw = window.localStorage.getItem(IMPORT_KEY);
        if (raw === null) return [];
        const result = validateImport(JSON.parse(raw));
        return result.ok ? result.questions : [];
      } catch (error) {
        return [];
      }
    }

    function saveImported(questions) {
      try {
        window.localStorage.setItem(IMPORT_KEY, JSON.stringify(questions));
        return true;
      } catch (error) {
        return false;
      }
    }

    // ------------------------------------------------------------- glyphs
    /** Sidebar glyph: a coffee cup in `currentColor`, like the host's own rows. */
    function JavaCupIcon(props) {
      const edge = typeof props.size === 'number' && props.size > 0 ? props.size : 16;
      return h(
        'svg',
        {
          width: edge,
          height: edge,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': 'true',
          style: { display: 'block' },
        },
        h('path', {
          d: 'M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z',
          stroke: 'currentColor',
          strokeWidth: '1.6',
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M16 10.5h1.6a2.4 2.4 0 0 1 0 4.8H16',
          stroke: 'currentColor',
          strokeWidth: '1.6',
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M7.5 6c0-1.2 1.2-1.6 1.2-2.9M11.5 5.6c0-1.4 1.4-1.9 1.4-3.4M15.5 6c0-1.2 1.2-1.6 1.2-2.9',
          stroke: 'currentColor',
          strokeWidth: '1.6',
          strokeLinecap: 'round',
          opacity: '0.75',
        }),
      );
    }

    function ChevronLeft() {
      return h(
        'svg',
        { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('path', {
          d: 'M10 3.5 5.5 8l4.5 4.5',
          stroke: 'currentColor',
          strokeWidth: '1.6',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    function StarIcon(filled) {
      return h(
        'svg',
        {
          width: 14,
          height: 14,
          viewBox: '0 0 24 24',
          fill: filled ? 'currentColor' : 'none',
          'aria-hidden': 'true',
        },
        h('path', {
          d: 'm12 3.6 2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.8l5.9-.9z',
          stroke: 'currentColor',
          strokeWidth: '1.5',
          strokeLinejoin: 'round',
        }),
      );
    }

    /** A 5-heart score row: filled hearts up to `value`, hollow after. */
    function HeartMeter(props) {
      const value = typeof props.value === 'number' ? props.value : 0;
      const hearts = [];
      for (let i = 1; i <= 5; i += 1) {
        hearts.push(
          h(
            'svg',
            {
              key: i,
              width: 11,
              height: 11,
              viewBox: '0 0 24 24',
              fill: i <= value ? 'currentColor' : 'none',
              'aria-hidden': 'true',
            },
            h('path', {
              d: 'M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13z',
              stroke: 'currentColor',
              strokeWidth: '1.7',
              strokeLinejoin: 'round',
            }),
          ),
        );
      }
      return h('span', { className: 'dji-meter', title: props.title }, hearts);
    }

    /** One labelled score: 「面试频率」/「难度」 beside a heart meter. */
    function ScoreRow(props) {
      return h(
        'span',
        { className: 'dji-score' },
        h('span', { className: 'dji-score-label' }, props.label),
        h(HeartMeter, { value: props.value, title: props.title }),
      );
    }

    /** Modal that accepts a pasted JSON bank and reports rule violations. */
    function ImportDialog(props) {
      const t = typeof props.t === 'function' ? props.t : (key) => key;
      const [text, setText] = useState('');
      const [errors, setErrors] = useState([]);
      const [result, setResult] = useState(null);
      const [fileName, setFileName] = useState('');
      const fileInput = useRef(null);

      const submit = () => {
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (error) {
          setErrors([{ index: -1, message: 'parse' }]);
          setResult(null);
          return;
        }
        const outcome = validateImport(parsed);
        if (!outcome.ok) {
          setErrors(outcome.errors);
          setResult(null);
          return;
        }
        setErrors([]);
        setResult(props.onImport(outcome.questions));
      };

      /**
       * Read a picked file into the textarea. Validation still runs on submit,
       * so a file is only ever a convenient way to fill the box — never a
       * bypass around the rules.
       */
      const readFile = (file) => {
        if (file === null || file === undefined) return;
        setResult(null);
        if (file.size > IMPORT_RULES.maxFileBytes) {
          setFileName(file.name || '');
          setErrors([{ index: -1, message: 'fileTooLarge', limit: '2 MB' }]);
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => {
          setFileName(file.name || '');
          setErrors([{ index: -1, message: 'fileRead' }]);
        };
        reader.onload = () => {
          setFileName(file.name || '');
          setErrors([]);
          setText(typeof reader.result === 'string' ? reader.result : '');
        };
        reader.readAsText(file, 'utf-8');
      };

      const errorList = errors.map((error, i) =>
        h(
          'li',
          { key: i },
          (error.index >= 0 ? t('import.row') + ' ' + (error.index + 1) + ' · ' : '')
            + t('import.err.' + error.message)
            + (error.limit ? ' (' + error.limit + ')' : ''),
        ),
      );

      return h(
        'div',
        {
          className: 'dji-backdrop',
          onClick: (event) => {
            if (event.target === event.currentTarget) props.onClose();
          },
        },
        h(
          'div',
          { className: 'dji-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('import.title') },
          h(
            'div',
            { className: 'dji-modal-head' },
            h('h2', { className: 'dji-modal-title' }, t('import.title')),
            h(
              'button',
              { type: 'button', className: 'dji-modal-x', onClick: props.onClose, 'aria-label': t('import.close') },
              '×',
            ),
          ),
          h(
            'div',
            { className: 'dji-modal-body' },
            h('p', { className: 'dji-modal-hint' }, t('import.hint')),
            h(
              'div',
              { className: 'dji-picker' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dji-btn dji-btn-pick',
                  onClick: () => {
                    if (fileInput.current) fileInput.current.click();
                  },
                },
                t('import.pick'),
              ),
              h('input', {
                ref: fileInput,
                type: 'file',
                accept: '.json,application/json,text/plain',
                className: 'dji-file',
                onChange: (event) => {
                  const picked = event.target.files && event.target.files[0];
                  readFile(picked || null);
                  // Reset so picking the same file twice still fires a change.
                  event.target.value = '';
                },
              }),
              h(
                'span',
                { className: 'dji-picker-note' },
                fileName === '' ? t('import.pickHint') : fileName,
              ),
            ),
            h(
              'ul',
              { className: 'dji-rules' },
              h('li', null, t('import.rule1')),
              h('li', null, t('import.rule2')),
              h('li', null, t('import.rule3')),
              h('li', null, t('import.rule4')),
              h('li', null, t('import.rule5')),
            ),
            h('textarea', {
              className: 'dji-textarea',
              value: text,
              spellCheck: false,
              placeholder: t('import.placeholder'),
              onChange: (event) => setText(event.target.value),
            }),
            errorList.length > 0 ? h('ul', { className: 'dji-errors' }, errorList) : null,
            result !== null
              ? h(
                  'p',
                  { className: 'dji-ok' },
                  t('import.done') + ' ' + result.added
                    + (result.skipped > 0 ? ' · ' + t('import.skipped') + ' ' + result.skipped : ''),
                )
              : null,
          ),
          h(
            'div',
            { className: 'dji-modal-foot' },
            h('button', { type: 'button', className: 'dji-btn', onClick: props.onClose }, t('import.cancel')),
            h(
              'button',
              {
                type: 'button',
                className: 'dji-btn dji-btn-primary',
                onClick: submit,
                disabled: text.trim() === '',
              },
              t('import.submit'),
            ),
          ),
        ),
      );
    }

    // -------------------------------------------------------------- page
    function JavaInterviewPage(props) {
      const t = typeof props.t === 'function' ? props.t : (key) => key;
      const goBack = typeof props.backToConversation === 'function' ? props.backToConversation : null;

      const [view, setView] = useState('all');
      const [favorites, setFavorites] = useState(loadFavorites);
      const [sortBy, setSortBy] = useState('random');
      const [imported, setImported] = useState(loadImported);
      const [showImport, setShowImport] = useState(false);
      const [order, setOrder] = useState(() => shuffle(BANK.map((item) => item.id)));
      const [offset, setOffset] = useState(0);
      const [revealed, setRevealed] = useState({});

      /** Built-in questions plus whatever was imported, with imports first-class. */
      const bank = useMemo(() => BANK.concat(imported), [imported]);
      const bankById = useMemo(() => new Map(bank.map((item) => [item.id, item])), [bank]);

      const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

      const pool = useMemo(() => {
        if (view === 'fav') return favorites.map((id) => bankById.get(id)).filter(Boolean);
        if (view === 'all') return bank;
        return bank.filter((item) => item.topic === view);
      }, [view, favorites, bank, bankById]);

      /**
       * The deck is rebuilt only when the POOL changes, not on every favorite
       * toggle: the ids are the whole state, so a stable signature keeps
       * starring a question from reshuffling the batch under the cursor.
       */
      const poolKey = useMemo(() => pool.map((item) => item.id).join(','), [pool]);

      useEffect(() => {
        setOrder(buildOrder(pool, sortBy));
        setOffset(0);
        setRevealed({});
      }, [poolKey, sortBy]);

      useEffect(() => {
        saveFavorites(favorites);
      }, [favorites]);

      /**
       * Every batch holds ten questions. When the pool is at least a batch
       * long the deck wraps around, so no question repeats inside one batch;
       * a pool smaller than ten (a short favorites list) shows just itself
       * rather than duplicating questions to pad the count.
       */
      const deck = useMemo(() => {
        if (order.length === 0) return [];
        if (order.length < PAGE_SIZE) {
          return order.map((id) => bankById.get(id)).filter(Boolean);
        }
        const cards = [];
        for (let i = 0; i < PAGE_SIZE; i += 1) {
          cards.push(bankById.get(order[(offset + i) % order.length]));
        }
        return cards.filter(Boolean);
      }, [order, offset, bankById]);

      const nextBatch = useCallback(() => {
        setRevealed({});
        const reshuffle = () => {
          // A ranked order must survive 「换一批」; only random mode reshuffles.
          setOrder(sortBy === 'random' ? shuffle(order) : order);
          setOffset(0);
        };
        if (order.length <= PAGE_SIZE) {
          reshuffle();
          return;
        }
        const next = offset + PAGE_SIZE;
        if (next >= order.length) {
          reshuffle();
        } else {
          setOffset(next);
        }
      }, [order, offset, sortBy]);

      const toggleFavorite = useCallback((id) => {
        setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [id].concat(prev)));
      }, []);

      const toggleReveal = useCallback((id) => {
        setRevealed((prev) => {
          const next = Object.assign({}, prev);
          if (next[id] === true) delete next[id];
          else next[id] = true;
          return next;
        });
      }, []);

      /**
       * Merge validated questions into the imported set. Ids colliding with a
       * built-in or an already-imported question are skipped, so an import can
       * never silently replace a shipped question or duplicate a card.
       */
      const handleImport = useCallback((questions) => {
        let added = 0;
        let skipped = 0;
        setImported((prev) => {
          const seen = new Set(BUILTIN_IDS);
          for (const item of prev) seen.add(item.id);
          const next = prev.slice();
          for (const item of questions) {
            if (seen.has(item.id)) { skipped += 1; continue; }
            seen.add(item.id);
            next.push(item);
            added += 1;
          }
          saveImported(next);
          return next;
        });
        return { added, skipped };
      }, []);

      const clearImported = useCallback(() => {
        setImported([]);
        saveImported([]);
      }, []);

      const tabs = [
        h(
          'button',
          {
            key: 'all',
            type: 'button',
            role: 'tab',
            'aria-selected': view === 'all',
            className: 'dji-tab' + (view === 'all' ? ' is-on' : ''),
            onClick: () => setView('all'),
          },
          t('tab.all'),
          h('span', { className: 'dji-tab-count' }, String(bank.length)),
        ),
      ];
      for (const topic of TOPICS) {
        const count = bank.filter((item) => item.topic === topic.id).length;
        tabs.push(
          h(
            'button',
            {
              key: topic.id,
              type: 'button',
              role: 'tab',
              'aria-selected': view === topic.id,
              className: 'dji-tab' + (view === topic.id ? ' is-on' : ''),
              onClick: () => setView(topic.id),
            },
            t('topic.' + topic.id),
            h('span', { className: 'dji-tab-count' }, String(count)),
          ),
        );
      }
      tabs.push(
        h(
          'button',
          {
            key: 'fav',
            type: 'button',
            role: 'tab',
            'aria-selected': view === 'fav',
            className: 'dji-tab dji-tab-fav' + (view === 'fav' ? ' is-on' : ''),
            onClick: () => setView('fav'),
          },
          StarIcon(view === 'fav'),
          t('tab.fav'),
          h('span', { className: 'dji-tab-count' }, String(favorites.length)),
        ),
      );

      const cards = deck.map((item, index) => {
        const open = revealed[item.id] === true;
        const starred = favoriteSet.has(item.id);
        return h(
          'li',
          { key: item.id, className: 'dji-card' },
          h(
            'div',
            { className: 'dji-card-head' },
            h('span', { className: 'dji-tag' }, t('topic.' + item.topic)),
            h('span', { className: 'dji-index' }, String(offset + index + 1)),
          ),
          h('p', { className: 'dji-question' }, item.q),
          h(
            'div',
            { className: 'dji-scores' },
            h(ScoreRow, { label: t('score.freq'), value: item.freq }),
            h(ScoreRow, { label: t('score.diff'), value: item.diff }),
          ),
          h(
            'div',
            { className: 'dji-card-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'dji-btn' + (open ? ' is-active' : ''),
                'aria-expanded': open,
                onClick: () => toggleReveal(item.id),
              },
              open ? t('action.hide') : t('action.reveal'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dji-btn dji-star' + (starred ? ' is-on' : ''),
                'aria-pressed': starred,
                title: starred ? t('action.unfavorite') : t('action.favorite'),
                onClick: () => toggleFavorite(item.id),
              },
              StarIcon(starred),
              h('span', null, starred ? t('action.unfavorite') : t('action.favorite')),
            ),
          ),
          open
            ? h(
                'div',
                { className: 'dji-answer' },
                h(
                  'ul',
                  null,
                  item.a.map((line, lineIndex) => h('li', { key: lineIndex }, line)),
                ),
              )
            : null,
        );
      });

      const emptyText = view === 'fav' ? t('empty.fav') : t('empty.pool');
      const total = order.length;
      const shownTo = Math.min(offset + deck.length, total);
      const progress = deck.length === 0 ? '0 / ' + total : offset + 1 + '–' + shownTo + ' / ' + total;
      const canRefresh = total > 0;

      return h(
        'div',
        { className: 'dji-page' },
        h(
          'div',
          { className: 'dji-inner' },
          h(
            'header',
            { className: 'dji-head' },
            goBack
              ? h('button', { type: 'button', className: 'dji-back', onClick: goBack }, ChevronLeft(), h('span', null, t('page.back')))
              : null,
            h(
              'div',
              { className: 'dji-title-row' },
              h('h1', { className: 'dji-title' }, t('page.title')),
              h('span', { className: 'dji-badge' }, bank.length + ' ' + t('page.rangeUnit')),
              h(
                'div',
                { className: 'dji-title-actions' },
                h(
                  'button',
                  { type: 'button', className: 'dji-btn', onClick: () => setShowImport(true) },
                  t('import.open'),
                ),
                imported.length > 0
                  ? h(
                      'button',
                      { type: 'button', className: 'dji-btn dji-btn-quiet', onClick: clearImported },
                      t('import.clear') + ' (' + imported.length + ')',
                    )
                  : null,
              ),
            ),
            h('p', { className: 'dji-desc' }, t('page.desc')),
          ),
          h('nav', { className: 'dji-tabs', role: 'tablist', 'aria-label': t('page.title') }, tabs),
          h(
            'div',
            { className: 'dji-bar' },
            h('span', { className: 'dji-progress' }, progress + ' ' + t('page.rangeUnit')),
            h(
              'div',
              { className: 'dji-bar-right' },
              h(
                'div',
                { className: 'dji-sort', role: 'group', 'aria-label': t('sort.label') },
                h('span', { className: 'dji-sort-label' }, t('sort.label')),
                SORTS.map((mode) =>
                  h(
                    'button',
                    {
                      key: mode,
                      type: 'button',
                      className: 'dji-sort-btn' + (sortBy === mode ? ' is-on' : ''),
                      'aria-pressed': sortBy === mode,
                      onClick: () => setSortBy(mode),
                    },
                    t('sort.' + mode),
                  ),
                ),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dji-btn dji-btn-primary',
                  onClick: nextBatch,
                  disabled: !canRefresh,
                },
                t('action.next'),
              ),
            ),
          ),
          deck.length === 0
            ? h('div', { className: 'dji-empty' }, emptyText)
            : h('ul', { className: 'dji-list' }, cards),
        ),
        showImport
          ? h(ImportDialog, { t, onClose: () => setShowImport(false), onImport: handleImport })
          : null,
      );
    }

    // -------------------------------------------------------------- styles
    const CSS = [
      '.dji-page{box-sizing:border-box;height:100%;overflow:auto;background:var(--dsw-alias-bg-base,#16171a);color:var(--dsw-alias-label-primary,#e6e6e6);padding:26px clamp(18px,3vw,40px) 48px}',
      '.dji-inner{width:100%;max-width:880px;margin:0 auto;display:flex;flex-direction:column;gap:16px}',
      '.dji-head{display:flex;flex-direction:column;gap:8px}',
      '.dji-back{appearance:none;font:inherit;font-size:13px;line-height:20px;cursor:pointer;align-self:flex-start;display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2,#36373b);background:var(--dsw-alias-bg-layer-1,#1c1d21);color:var(--dsw-alias-label-secondary,#c7c7c7)}',
      '.dji-back:hover{color:var(--dsw-alias-label-primary,#e6e6e6)}',
      '.dji-back svg{flex:none}',
      '.dji-title-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
      '.dji-title{margin:0;font-size:20px;font-weight:600;line-height:1.4}',
      '.dji-badge{font-size:12px;line-height:18px;padding:2px 8px;border-radius:999px;color:var(--dsw-alias-label-secondary,#c7c7c7);background:var(--dsw-alias-bg-layer-2,#24252a);border:1px solid var(--dsw-alias-border-l1,#303136)}',
      '.dji-desc{margin:0;font-size:13px;line-height:1.6;color:var(--dsw-alias-label-secondary,#c7c7c7)}',
      '.dji-tabs{display:flex;flex-wrap:wrap;gap:8px}',
      '.dji-tab{appearance:none;font:inherit;font-size:13px;line-height:20px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1,#303136);background:var(--dsw-alias-bg-layer-1,#1c1d21);color:var(--dsw-alias-label-secondary,#c7c7c7);transition:background .12s ease,color .12s ease,border-color .12s ease}',
      '.dji-tab:hover{color:var(--dsw-alias-label-primary,#e6e6e6);border-color:var(--dsw-alias-border-l2,#36373b)}',
      '.dji-tab.is-on{background:var(--dsw-alias-bg-layer-2,#24252a);border-color:var(--dsw-alias-brand-primary,#4a7dff);color:var(--dsw-alias-brand-primary,#4a7dff);font-weight:500}',
      '.dji-tab-count{font-size:11px;opacity:.72;font-variant-numeric:tabular-nums}',
      '.dji-bar{display:flex;align-items:center;justify-content:space-between;gap:10px 14px;flex-wrap:wrap;padding:10px 14px;border-radius:10px;background:var(--dsw-alias-bg-layer-1,#1c1d21);border:1px solid var(--dsw-alias-border-l1,#303136)}',
      '.dji-progress{font-size:12.5px;line-height:18px;color:var(--dsw-alias-label-secondary,#c7c7c7);font-variant-numeric:tabular-nums;white-space:nowrap}',
      '.dji-bar-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}',
      '.dji-sort{display:flex;align-items:center;gap:2px;flex-wrap:wrap;padding:3px;border-radius:10px;background:var(--dsw-alias-bg-layer-2,#24252a);border:1px solid var(--dsw-alias-border-l1,#303136)}',
      '.dji-sort-label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#c7c7c7);padding:0 6px 0 3px}',
      '.dji-sort-btn{appearance:none;font:inherit;padding:4px 10px;border-radius:7px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary,#c7c7c7);font-size:12px;line-height:18px;cursor:pointer;white-space:nowrap;transition:background .15s,color .15s,border-color .15s}',
      '.dji-sort-btn:hover{background:var(--dsw-alias-bg-layer-1,#1c1d21);color:var(--dsw-alias-label-primary,#e6e6e6)}',
      '.dji-sort-btn.is-on{background:var(--dsw-alias-bg-layer-1,#1c1d21);border-color:var(--dsw-alias-brand-primary,#4a7dff);color:var(--dsw-alias-brand-primary,#4a7dff);font-weight:600}',
      '.dji-sort-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4a7dff);outline-offset:2px}',
      '.dji-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}',
      '.dji-card{display:flex;flex-direction:column;gap:10px;padding:16px 18px;border-radius:12px;background:var(--dsw-alias-bg-layer-1,#1c1d21);border:1px solid var(--dsw-alias-border-l1,#303136)}',
      '.dji-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px}',
      '.dji-tag{font-size:11.5px;line-height:18px;padding:1px 8px;border-radius:6px;color:var(--dsw-alias-brand-primary,#4a7dff);background:var(--dsw-alias-bg-layer-2,#24252a);border:1px solid var(--dsw-alias-border-l1,#303136)}',
      '.dji-index{font-size:12px;color:var(--dsw-alias-state-idle-primary,#8a8f98);font-variant-numeric:tabular-nums}',
      '.dji-question{margin:0;font-size:15px;font-weight:600;line-height:1.6}',
      '.dji-scores{display:flex;gap:16px;flex-wrap:wrap}',
      '.dji-score{display:inline-flex;align-items:center;gap:5px}',
      '.dji-score-label{font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-secondary,#c7c7c7)}',
      '.dji-meter{display:inline-flex;align-items:center;gap:2px;color:var(--dsw-alias-state-error-primary,#e5484d)}',
      '.dji-meter svg{flex:none;opacity:.9}',
      '.dji-score:last-child .dji-meter{color:var(--dsw-alias-state-warn-primary,#e2a03f)}',
      '.dji-card-actions{display:flex;gap:8px;flex-wrap:wrap}',
      '.dji-btn{appearance:none;font:inherit;font-size:12.5px;line-height:18px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2,#36373b);background:var(--dsw-alias-bg-layer-2,#24252a);color:var(--dsw-alias-label-secondary,#c7c7c7);transition:background .12s ease,color .12s ease,border-color .12s ease}',
      '.dji-btn:hover:not(:disabled){color:var(--dsw-alias-label-primary,#e6e6e6);border-color:var(--dsw-alias-border-l2,#4a4b52)}',
      '.dji-btn:disabled{opacity:.5;cursor:default}',
      '.dji-btn.is-active{color:var(--dsw-alias-brand-primary,#4a7dff);border-color:var(--dsw-alias-brand-primary,#4a7dff)}',
      '.dji-btn-primary{background:var(--dsw-alias-bg-layer-2,#24252a);border-color:var(--dsw-alias-brand-primary,#4a7dff);color:var(--dsw-alias-brand-primary,#4a7dff);font-weight:500}',
      '.dji-btn-primary:hover:not(:disabled){border-color:var(--dsw-alias-brand-primary,#4a7dff);color:var(--dsw-alias-brand-primary,#4a7dff);filter:brightness(1.12)}',
      '.dji-star.is-on{color:var(--dsw-alias-state-warn-primary,#e2a03f);border-color:var(--dsw-alias-state-warn-primary,#e2a03f)}',
      '.dji-star svg{flex:none}',
      '.dji-answer{margin:0;padding:12px 14px;border-radius:10px;background:var(--dsw-alias-bg-layer-2,#24252a);border:1px solid var(--dsw-alias-border-l1,#303136)}',
      '.dji-answer ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:7px}',
      '.dji-answer li{font-size:13.5px;line-height:1.75;color:var(--dsw-alias-label-primary,#e6e6e6)}',
      '.dji-empty{padding:34px 20px;text-align:center;font-size:13.5px;line-height:1.7;border-radius:12px;color:var(--dsw-alias-label-secondary,#c7c7c7);background:var(--dsw-alias-bg-layer-1,#1c1d21);border:1px dashed var(--dsw-alias-border-l2,#36373b)}',
      '.dji-title-actions{display:flex;align-items:center;gap:8px;margin-left:auto}',
      '.dji-btn-quiet{background:transparent}',
      '.dji-backdrop{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--dsw-alias-bg-overlay,#000000a6)}',
      '.dji-modal{display:flex;flex-direction:column;width:100%;max-width:620px;max-height:86vh;border-radius:14px;background:var(--dsw-alias-bg-layer-1,#1c1d21);border:1px solid var(--dsw-alias-border-l2,#36373b);box-shadow:0 18px 48px rgba(0,0,0,.4);overflow:hidden}',
      '.dji-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--dsw-alias-border-l1,#303136)}',
      '.dji-modal-title{margin:0;font-size:15px;font-weight:600;line-height:1.4}',
      '.dji-modal-x{appearance:none;font:inherit;font-size:18px;line-height:1;cursor:pointer;padding:2px 8px;border-radius:7px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary,#c7c7c7)}',
      '.dji-modal-x:hover{background:var(--dsw-alias-bg-layer-2,#24252a);color:var(--dsw-alias-label-primary,#e6e6e6)}',
      '.dji-modal-body{display:flex;flex-direction:column;gap:10px;padding:14px 16px;overflow:auto}',
      '.dji-modal-hint{margin:0;font-size:12.5px;line-height:1.6;color:var(--dsw-alias-label-secondary,#c7c7c7)}',
      '.dji-rules{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:5px}',
      '.dji-rules li{font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary,#c7c7c7)}',
      '.dji-picker{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;border-radius:10px;background:var(--dsw-alias-bg-layer-2,#24252a);border:1px dashed var(--dsw-alias-border-l2,#36373b)}',
      '.dji-file{display:none}',
      '.dji-btn-pick{flex:none}',
      '.dji-picker-note{font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary,#c7c7c7);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}',
      '.dji-textarea{box-sizing:border-box;width:100%;min-height:150px;resize:vertical;padding:10px 12px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2,#36373b);background:var(--dsw-alias-bg-base,#16171a);color:var(--dsw-alias-label-primary,#e6e6e6);font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12.5px;line-height:1.6}',
      '.dji-textarea:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4a7dff);outline-offset:1px}',
      '.dji-errors{margin:0;padding:10px 12px 10px 28px;border-radius:10px;display:flex;flex-direction:column;gap:4px;background:var(--dsw-alias-bg-layer-2,#24252a);border:1px solid var(--dsw-alias-state-error-primary,#e5484d)}',
      '.dji-errors li{font-size:12px;line-height:1.6;color:var(--dsw-alias-state-error-primary,#e5484d)}',
      '.dji-ok{margin:0;font-size:12.5px;line-height:1.6;color:var(--dsw-alias-state-success-primary,#3fb950)}',
      '.dji-modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--dsw-alias-border-l1,#303136)}',
    ].join('');

    function ensureStyles() {
      const id = 'dsh-java-interview/client.css';
      const existing = document.querySelector('style[data-plugin-css="' + id + '"]');
      if (existing !== null) {
        existing.textContent = CSS;
        return;
      }
      const styleTag = document.createElement('style');
      styleTag.dataset.plugin = 'dsh-java-interview';
      styleTag.dataset.pluginCss = id;
      styleTag.textContent = CSS;
      document.head.appendChild(styleTag);
    }

    // --------------------------------------------------------------- apply
    const inject = ['slots', 'locale'];

    function apply(ctx) {
      ctx.effect(
        () =>
          ctx.locale.register(NS, {
            zh: zh,
            en: en,
          }),
        'dsh-java-interview: copy',
      );
      const t = ctx.locale.bind(NS);

      ctx.effect(() => {
        ensureStyles();
        return () => {
          const styleTag = document.querySelector('style[data-plugin-css="dsh-java-interview/client.css"]');
          if (styleTag !== null) styleTag.remove();
        };
      }, 'dsh-java-interview: styles');

      const backToConversation = () => {
        const layout = ctx.get('layout');
        if (layout !== undefined && typeof layout.selectPanel === 'function') layout.selectPanel(null);
      };

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 4,
            label: () => t('nav.label'),
            locale: NS,
          },
          JavaCupIcon,
        ),
      );

      ctx.slots.inject('main', () =>
        ctx.slots.register(
          {
            name: 'main',
            key: PANEL_ID,
            locale: NS,
            inject: () => ({ t: t, backToConversation: backToConversation }),
          },
          JavaInterviewPage,
        ),
      );
    }

    return { inject: inject, apply: apply };
  },
});
